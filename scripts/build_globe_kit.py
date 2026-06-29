"""Build the low-poly web accessory kit used by the portfolio globe.

Run with Blender 5.1:
  blender --background --python scripts/build_globe_kit.py
"""

from pathlib import Path
import math

import bpy


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "models" / "globe-kit.glb"


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for data in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for block in list(data):
            if block.users == 0:
                data.remove(block)


def material(
    name,
    color,
    metallic=0.0,
    roughness=0.45,
    emission=None,
    emission_strength=1.35,
    alpha=1.0,
):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, alpha)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    if emission:
        shader.inputs["Emission Color"].default_value = (*emission, 1.0)
        shader.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1:
        shader.inputs["Alpha"].default_value = alpha
        mat.surface_render_method = "DITHERED"
    return mat


def parent_to(obj, root):
    obj.parent = root
    return obj


def bevel(obj, width=0.05, segments=2):
    modifier = obj.modifiers.new("Web bevel", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def add_cube(name, location, scale, mat, root):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel(obj, min(scale) * 0.22, 2)
    obj.data.materials.append(mat)
    return parent_to(obj, root)


def add_uv_sphere(name, location, scale, mat, root, segments=20, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return parent_to(obj, root)


def add_torus(name, location, major, minor, rotation, mat, root):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major,
        minor_radius=minor,
        major_segments=40,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return parent_to(obj, root)


def build_node_beacon(materials):
    root = bpy.data.objects.new("NodeBeacon", None)
    bpy.context.collection.objects.link(root)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.18, location=(0, 0.23, 0))
    core = bpy.context.object
    core.name = "NodeBeacon_Core"
    core.scale = (0.72, 1.4, 0.72)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    core.data.materials.append(materials["signal"])
    parent_to(core, root)

    add_torus(
        "NodeBeacon_Ring",
        (0, 0.18, 0),
        0.29,
        0.018,
        (math.pi / 2, 0, 0),
        materials["gold"],
        root,
    )

    bpy.ops.mesh.primitive_cone_add(
        vertices=12,
        radius1=0.105,
        radius2=0.025,
        depth=0.32,
        location=(0, 0.48, 0),
    )
    spire = bpy.context.object
    spire.name = "NodeBeacon_Spire"
    spire.data.materials.append(materials["silver"])
    parent_to(spire, root)

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=0.105,
        depth=0.035,
        location=(0, 0.025, 0),
    )
    base = bpy.context.object
    base.name = "NodeBeacon_Base"
    base.data.materials.append(materials["dark"])
    parent_to(base, root)


def build_satellite(materials):
    root = bpy.data.objects.new("Satellite", None)
    bpy.context.collection.objects.link(root)

    body = add_cube(
        "Satellite_Body",
        (0, 0, 0),
        (0.18, 0.24, 0.16),
        materials["dark"],
        root,
    )
    body.rotation_euler = (0.08, 0.15, -0.06)

    for side in (-1, 1):
        add_cube(
            f"Satellite_Panel_{'L' if side < 0 else 'R'}",
            (side * 0.48, 0, 0),
            (0.25, 0.018, 0.17),
            materials["solar"],
            root,
        )
        add_cube(
            f"Satellite_Arm_{'L' if side < 0 else 'R'}",
            (side * 0.28, 0, 0),
            (0.12, 0.025, 0.025),
            materials["gold"],
            root,
        )

    bpy.ops.mesh.primitive_cone_add(
        vertices=24,
        radius1=0.19,
        radius2=0.055,
        depth=0.12,
        location=(0, 0.29, 0),
    )
    dish = bpy.context.object
    dish.name = "Satellite_Dish"
    dish.data.materials.append(materials["silver"])
    parent_to(dish, root)

    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16,
        ring_count=8,
        radius=0.06,
        location=(0, 0.43, 0),
    )
    signal = bpy.context.object
    signal.name = "Satellite_Signal"
    signal.data.materials.append(materials["signal"])
    parent_to(signal, root)


def build_cloud_cluster(materials):
    root = bpy.data.objects.new("CloudCluster", None)
    bpy.context.collection.objects.link(root)
    puffs = [
        ((-0.34, 0.04, 0.02), (0.34, 0.10, 0.22)),
        ((-0.08, 0.09, 0.02), (0.42, 0.14, 0.28)),
        ((0.22, 0.06, -0.01), (0.36, 0.11, 0.24)),
        ((0.45, 0.02, 0.02), (0.25, 0.08, 0.18)),
        ((0.05, 0.13, -0.18), (0.25, 0.09, 0.19)),
    ]
    for index, (location, scale) in enumerate(puffs):
        add_uv_sphere(
            f"Cloud_Puff_{index + 1:02}",
            location,
            scale,
            materials["cloud"],
            root,
            segments=16,
            rings=8,
        )


def build_orbital_capsule(materials):
    root = bpy.data.objects.new("OrbitalCapsule", None)
    bpy.context.collection.objects.link(root)
    add_uv_sphere(
        "Capsule_Core",
        (0, 0, 0),
        (0.25, 0.25, 0.25),
        materials["silver"],
        root,
        segments=20,
        rings=12,
    )
    for axis, rotation in enumerate(
        ((math.pi / 2, 0, 0), (0, math.pi / 2, 0), (math.pi / 3, math.pi / 5, 0))
    ):
        add_torus(
            f"Capsule_Orbit_{axis + 1:02}",
            (0, 0, 0),
            0.42 + axis * 0.055,
            0.028,
            rotation,
            materials["orange"] if axis != 1 else materials["glass"],
            root,
        )


def main():
    reset_scene()
    materials = {
        "dark": material("Kit_Gunmetal", (0.028, 0.032, 0.042), 0.82, 0.22),
        "silver": material("Kit_Silver", (0.64, 0.69, 0.76), 0.76, 0.2),
        "gold": material("Kit_Gold", (0.95, 0.49, 0.055), 0.66, 0.22),
        "orange": material(
            "Kit_Orange",
            (1.0, 0.24, 0.025),
            0.42,
            0.22,
            emission=(1.0, 0.12, 0.01),
        ),
        "signal": material(
            "Kit_Signal",
            (0.56, 0.006, 0.018),
            0.52,
            0.2,
            emission=(0.7, 0.005, 0.012),
            emission_strength=0.8,
        ),
        "solar": material(
            "Kit_Solar",
            (0.09, 0.035, 0.12),
            0.74,
            0.2,
            emission=(0.25, 0.015, 0.12),
        ),
        "cloud": material(
            "Kit_Cloud",
            (0.86, 0.9, 0.94),
            0.05,
            0.26,
            alpha=0.18,
        ),
        "glass": material(
            "Kit_Glass",
            (0.78, 0.84, 0.92),
            0.18,
            0.12,
            alpha=0.24,
        ),
    }

    build_node_beacon(materials)
    build_satellite(materials)
    build_cloud_cluster(materials)
    build_orbital_capsule(materials)

    bpy.ops.object.select_all(action="SELECT")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"Exported web globe kit to {OUTPUT}")


if __name__ == "__main__":
    main()
