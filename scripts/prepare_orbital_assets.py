"""Prepare the downloaded CGTrader assets for the portfolio web experience.

Run with Blender 5.1.2:
  blender --background --python scripts/prepare_orbital_assets.py

Outputs:
  public/models/digital-globe.glb
  public/models/space-station-web.glb
  public/models/orbital-node.glb
  public/textures/cloud-field-6.png
  public/textures/cloud-descent-01.png
  public/textures/cloud-descent-02.png
  public/textures/cloud-descent-03.png
"""

from pathlib import Path
import math

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = Path.home() / "Downloads"
MODEL_DIR = ROOT / "public" / "models"
TEXTURE_DIR = ROOT / "public" / "textures"

GLOBE_SOURCE = DOWNLOADS / "uploads_files_5554343_Globe_Digital.blend"
STATION_SOURCE = DOWNLOADS / "uploads_files_6529866_space+station.glb"
CLOUD_6_ROOT = (
    DOWNLOADS
    / "uploads_files_6209340_Cumulonimbus_Field_6_eighth"
    / "Cumulonimbus_Field_6"
)
CLOUD_4_ROOT = (
    DOWNLOADS
    / "uploads_files_6209340_Cumulonimbus_Field_4_eighth"
    / "Cumulonimbus_Field_4"
)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def principled_material(
    name,
    color,
    metallic=0.0,
    roughness=0.5,
    emission=None,
    emission_strength=0.0,
    alpha=1.0,
):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, alpha)
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Alpha"].default_value = alpha
    if emission is not None:
        shader.inputs["Emission Color"].default_value = (*emission, 1.0)
        shader.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1:
        material.surface_render_method = "DITHERED"
    return material


def replace_material(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)


def export_glb(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"Exported {path}")


def prepare_globe():
    bpy.ops.wm.open_mainfile(filepath=str(GLOBE_SOURCE))

    keep_names = {
        "Outer Layer-Continents",
        "Inner Layer-Base",
        "Middle Layer-Holo Grid",
        "Globe",
    }
    for obj in list(bpy.context.scene.objects):
        if obj.name not in keep_names:
            bpy.data.objects.remove(obj, do_unlink=True)

    outer = bpy.data.objects["Outer Layer-Continents"]
    inner = bpy.data.objects["Inner Layer-Base"]
    grid = bpy.data.objects["Middle Layer-Holo Grid"]
    root = bpy.data.objects.get("Globe")
    root.name = "DigitalGlobe"
    # The marketplace scene ships with an artistic tilt on both the root and
    # every sphere. Neutralizing those rotations keeps the equirectangular map
    # aligned with real latitude/longitude data in the web experience.
    root.rotation_euler = (0, 0, 0)

    outer.name = "MapSphere"
    inner.name = "OceanSphere"
    grid.name = "GridSphere"

    ocean_material = principled_material(
        "Orbital_Ocean",
        (0.004, 0.007, 0.012),
        metallic=0.62,
        roughness=0.32,
        emission=(0.0, 0.01, 0.018),
        emission_strength=0.15,
    )
    grid_material = principled_material(
        "Orbital_Grid",
        (0.18, 0.3, 0.34),
        metallic=0.2,
        roughness=0.5,
        emission=(0.17, 0.34, 0.38),
        emission_strength=0.65,
        alpha=0.32,
    )
    replace_material(inner, ocean_material)
    replace_material(grid, grid_material)

    source_image = bpy.data.images.get("Map")
    if source_image is None:
        raise RuntimeError("The Globe_Digital source is missing its packed Map image.")
    source_image.scale(2048, 1024)
    source_image.pack()

    map_material = bpy.data.materials.new("Orbital_Map")
    map_material.use_nodes = True
    nodes = map_material.node_tree.nodes
    links = map_material.node_tree.links
    for node in list(nodes):
        nodes.remove(node)
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = source_image
    texture.interpolation = "Linear"
    shader.inputs["Metallic"].default_value = 0.08
    shader.inputs["Roughness"].default_value = 0.74
    shader.inputs["Emission Strength"].default_value = 0.42
    links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    links.new(texture.outputs["Color"], shader.inputs["Emission Color"])
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    # The source continent shell stops at z=0.944 instead of reaching the
    # north pole, leaving a large open cap that exposes the black ocean sphere.
    # Rebuild only that damaged shell as a complete, smoother UV sphere while
    # retaining the marketplace texture and the original inner/grid layers.
    bpy.data.objects.remove(outer, do_unlink=True)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=96,
        ring_count=48,
        radius=2.04,
        location=(0, 0, 0),
    )
    outer = bpy.context.object
    outer.name = "MapSphere"
    outer.parent = root
    outer.rotation_euler = (0, 0, 0)
    replace_material(outer, map_material)
    bpy.ops.object.shade_smooth()

    for obj in (inner, grid):
        obj.parent = root
        obj.rotation_euler = (0, 0, 0)
        obj.scale *= 0.244
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)

    export_glb(MODEL_DIR / "digital-globe.glb")


def world_bounds(objects):
    points = []
    for obj in objects:
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    minimum = Vector((
        min(point.x for point in points),
        min(point.y for point in points),
        min(point.z for point in points),
    ))
    maximum = Vector((
        max(point.x for point in points),
        max(point.y for point in points),
        max(point.z for point in points),
    ))
    return minimum, maximum


def prepare_station():
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=str(STATION_SOURCE))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

    for obj in list(meshes):
        if obj.name in {"Cube", "Light", "Camera"}:
            bpy.data.objects.remove(obj, do_unlink=True)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]

    main_mesh = max(meshes, key=lambda item: len(item.data.polygons))
    for obj in meshes:
        if len(obj.data.polygons) <= 20_000:
            continue
        modifier = obj.modifiers.new("Web decimation", "DECIMATE")
        modifier.ratio = 0.18 if obj == main_mesh else 0.35
        modifier.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)

    for image in bpy.data.images:
        if image.size[0] <= 0 or image.size[1] <= 0:
            continue
        maximum = 512
        ratio = maximum / max(image.size)
        if ratio < 1:
            image.scale(
                max(4, int(image.size[0] * ratio)),
                max(4, int(image.size[1] * ratio)),
            )
            image.pack()

    minimum, maximum = world_bounds(meshes)
    center = (minimum + maximum) * 0.5
    largest_dimension = max(maximum - minimum)
    scale = 1.75 / largest_dimension

    root = bpy.data.objects.new("SpaceStation", None)
    bpy.context.collection.objects.link(root)
    for obj in meshes:
        obj.matrix_world.translation -= center
        obj.parent = root
        obj.scale *= scale
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.select_set(False)

    export_glb(MODEL_DIR / "space-station-web.glb")


def add_torus(name, radius, tube, rotation, material, parent):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius,
        minor_radius=tube,
        major_segments=48,
        minor_segments=8,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    obj.parent = parent
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def prepare_node():
    reset_scene()
    root = bpy.data.objects.new("OrbitalNode", None)
    bpy.context.collection.objects.link(root)

    metal = principled_material(
        "Node_Metal",
        (0.14, 0.18, 0.2),
        metallic=0.86,
        roughness=0.22,
    )
    signal = principled_material(
        "Node_Signal",
        (0.8, 0.29, 0.035),
        metallic=0.38,
        roughness=0.18,
        emission=(1.0, 0.19, 0.015),
        emission_strength=2.2,
    )
    glass = principled_material(
        "Node_Glass",
        (0.52, 0.68, 0.7),
        metallic=0.12,
        roughness=0.16,
        emission=(0.42, 0.7, 0.72),
        emission_strength=0.5,
        alpha=0.38,
    )

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.32)
    core = bpy.context.object
    core.name = "NodeCore"
    core.data.materials.append(glass)
    core.parent = root
    for polygon in core.data.polygons:
        polygon.use_smooth = True

    add_torus("NodeOrbit_A", 0.48, 0.022, (math.pi / 2, 0, 0), signal, root)
    add_torus("NodeOrbit_B", 0.58, 0.014, (0.48, 0.62, 0), metal, root)
    add_torus("NodeOrbit_C", 0.67, 0.01, (-0.62, 0.25, 0.38), glass, root)

    for index in range(4):
        angle = index * math.pi / 2
        bpy.ops.mesh.primitive_cone_add(
            vertices=12,
            radius1=0.065,
            radius2=0.018,
            depth=0.26,
            location=(math.cos(angle) * 0.5, math.sin(angle) * 0.5, 0),
            rotation=(0, math.pi / 2, angle),
        )
        spike = bpy.context.object
        spike.name = f"NodeRelay_{index + 1:02}"
        spike.data.materials.append(signal if index == 0 else metal)
        spike.parent = root

    export_glb(MODEL_DIR / "orbital-node.glb")


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_volume_sprite(vdb_path, output_path, yaw=0.0, density=0.72):
    reset_scene()
    bpy.ops.object.volume_import(filepath=str(vdb_path))
    volume = bpy.context.object
    volume.name = output_path.stem
    volume.data.grids.load()
    volume.scale = (0.00008, 0.00008, 0.00008)
    volume.rotation_euler = (math.pi / 2, 0, yaw)
    bpy.context.view_layer.update()

    local_center = sum((Vector(corner) for corner in volume.bound_box), Vector()) / 8
    world_center = volume.matrix_world @ local_center
    volume.location -= world_center

    material = bpy.data.materials.new(f"{output_path.stem}_Volume")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    for node in list(nodes):
        nodes.remove(node)
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeVolumePrincipled")
    shader.inputs["Color"].default_value = (0.84, 0.89, 0.92, 1.0)
    shader.inputs["Density"].default_value = density
    shader.inputs["Anisotropy"].default_value = 0.24
    links.new(shader.outputs["Volume"], output.inputs["Volume"])
    volume.data.materials.append(material)

    bpy.ops.object.camera_add(location=(0, -8.6, 2.45))
    camera = bpy.context.object
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 7.4
    look_at(camera, (0, 0, 0.35))

    bpy.ops.object.light_add(type="AREA", location=(-3.4, -3.2, 5.0))
    key = bpy.context.object
    key.data.energy = 1150
    key.data.shape = "DISK"
    key.data.size = 5.5
    look_at(key, (0, 0, 0))

    bpy.ops.object.light_add(type="AREA", location=(4.2, -1.0, 2.0))
    fill = bpy.context.object
    fill.data.energy = 520
    fill.data.size = 4.0
    fill.data.color = (0.32, 0.5, 0.62)
    look_at(fill, (0, 0, 0))

    scene = bpy.context.scene
    scene.camera = camera
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 768
    scene.render.resolution_y = 512
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(output_path)
    scene.render.resolution_percentage = 100
    if scene.world is None:
        scene.world = bpy.data.worlds.new("Orbital World")
    scene.world.color = (0, 0, 0)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {output_path}")


def prepare_clouds():
    render_volume_sprite(
        CLOUD_6_ROOT / "f180" / "Cumulonimbus_Field_6.f180.eighth.vdb",
        TEXTURE_DIR / "cloud-field-6.png",
        yaw=-0.12,
        density=0.66,
    )
    frames = (
        ("f072", "Cumulonimbus_Field_4.f072.eighth.vdb", -0.18, 0.72),
        ("f120", "Cumulonimbus_Field_4.f120.eighth.vdb", 0.08, 0.68),
        ("f168", "Cumulonimbus_Field_4.f168.eighth.vdb", 0.24, 0.64),
    )
    for index, (folder, filename, yaw, density) in enumerate(frames, start=1):
        render_volume_sprite(
            CLOUD_4_ROOT / folder / filename,
            TEXTURE_DIR / f"cloud-descent-{index:02}.png",
            yaw=yaw,
            density=density,
        )


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
    prepare_globe()
    prepare_station()
    prepare_node()
    prepare_clouds()
    print("Orbital asset preparation complete.")


if __name__ == "__main__":
    main()
