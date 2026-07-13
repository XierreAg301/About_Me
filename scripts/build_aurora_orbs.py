import bpy
import math
import os
from mathutils import Vector


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'models', 'aurora-orbs')
os.makedirs(OUT, exist_ok=True)

PALETTE = {
    'ice': (0.60, 0.86, 0.83, 1),
    'mint': (0.064, 0.393, 0.323, 1),
    'forest': (0.0, 0.084, 0.074, 1),
    'night': (0.002, 0.022, 0.021, 1),
    'silver': (0.52, 0.55, 0.56, 1),
    'graphite': (0.055, 0.06, 0.065, 1),
    'bronze': (0.48, 0.27, 0.13, 1),
}


def material(name, color, metallic=0.5, roughness=0.32, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        bsdf.inputs['Emission Color'].default_value = color
        bsdf.inputs['Emission Strength'].default_value = emission
    return mat


ICE = material('Aquamarine Ice', PALETTE['ice'], 0.25, 0.2, 0.25)
MINT = material('Aurora Mint', PALETTE['mint'], 0.7, 0.25)
FOREST = material('Forest Teal', PALETTE['forest'], 0.75, 0.28)
NIGHT = material('Night Teal', PALETTE['night'], 0.65, 0.38)
SILVER = material('Gunmetal Silver', PALETTE['silver'], 0.82, 0.3)
GRAPHITE = material('Graphite', PALETTE['graphite'], 0.8, 0.32)
BRONZE = material('Warm Bronze', PALETTE['bronze'], 0.82, 0.23)


def smooth(obj):
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def uv_sphere(name, radius, location=(0, 0, 0), mat=FOREST, segments=32, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return smooth(obj)


def ico(name, radius, location=(0, 0, 0), mat=FOREST, subdivisions=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdivisions, radius=radius, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def torus(name, major, minor, location=(0, 0, 0), rotation=(0, 0, 0), mat=MINT):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major,
        minor_radius=minor,
        major_segments=48,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return smooth(obj)


def cube(name, scale, location=(0, 0, 0), rotation=(0, 0, 0), mat=MINT, bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
    return obj


def empty(name, location=(0, 0, 0)):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    return obj


def cylinder_between(name, start, end, radius=0.035, mat=SILVER, vertices=12):
    start = Vector(start)
    end = Vector(end)
    delta = end - start
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=delta.length,
        location=(start + end) * 0.5,
    )
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    obj.data.materials.append(mat)
    return smooth(obj)


def cylinder(name, radius, depth, location=(0, 0, 0), mat=GRAPHITE, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=location,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new('Machined edge', 'BEVEL')
    bevel.width = min(depth * 0.2, 0.035)
    bevel.segments = 2
    return smooth(obj)


def arc_ring(name, major, minor, start_angle, end_angle, z=0, rotation=(0, 0, 0), mat=SILVER, steps=72):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth = minor
    curve.bevel_resolution = 2
    spline = curve.splines.new('NURBS')
    spline.points.add(steps)
    for index in range(steps + 1):
        t = index / steps
        angle = start_angle + (end_angle - start_angle) * t
        spline.points[index].co = (major * math.cos(angle), major * math.sin(angle), z, 1)
    spline.order_u = min(3, steps + 1)
    spline.use_endpoint_u = True
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.rotation_euler = rotation
    obj.data.materials.append(mat)
    return obj


def orient_to_normal(obj, normal):
    normal = Vector(normal).normalized()
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(normal)
    return obj


def polygon_loop(name, center, normal, radius, sides=6, thickness=0.035, mat=BRONZE, phase=0):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth = thickness
    curve.bevel_resolution = 2
    spline = curve.splines.new('POLY')
    spline.points.add(sides - 1)
    for index in range(sides):
        angle = phase + math.tau * index / sides
        spline.points[index].co = (radius * math.cos(angle), radius * math.sin(angle), 0, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = center
    orient_to_normal(obj, normal)
    obj.data.materials.append(mat)
    return obj


def polyline(name, points, thickness=0.018, mat=SILVER, cyclic=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth = thickness
    curve.bevel_resolution = 1
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for index, point in enumerate(points):
        spline.points[index].co = (*point, 1)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def shell_meridians(prefix, radius=1.215, count=10, upper=True):
    objects = []
    theta_start, theta_end = ((0.12, 1.2) if upper else (math.pi - 1.2, math.pi - 0.12))
    for line in range(count):
        phi = math.tau * line / count + 0.1
        points = []
        for step in range(18):
            theta = theta_start + (theta_end - theta_start) * step / 17
            points.append((
                radius * math.sin(theta) * math.cos(phi),
                radius * math.sin(theta) * math.sin(phi),
                radius * math.cos(theta),
            ))
        objects.append(polyline(f'{prefix}_ShellSeam_{line:02d}', points, 0.012, GRAPHITE))
    return objects


def maze_traces(prefix, radius=1.285, count=14):
    objects = []
    for trace in range(count):
        angle = math.tau * trace / count + 0.025 * (trace % 3)
        z = -0.36 + 0.055 * (trace % 6)
        points = []
        for step in range(9):
            points.append((radius * math.cos(angle), radius * math.sin(angle), z))
            if step % 2 == 0:
                angle += 0.09 + 0.025 * ((trace + step) % 3)
            else:
                z += 0.085 * (1 if ((trace + step) % 4 < 2) else -1)
                z = max(-0.43, min(0.43, z))
        objects.append(polyline(f'{prefix}_ContinuousTrace_{trace:02d}', points, 0.018, SILVER))
    return objects


def ringed_satellite(prefix, location, radius=0.24, rotation=(0.4, 0.2, 0)):
    rig = empty(f'{prefix}_SatelliteRig')
    parts = [
        uv_sphere(f'{prefix}_Body', radius, location, SILVER, 24, 12),
        torus(f'{prefix}_Band', radius * 1.08, radius * 0.1, location, rotation, BRONZE),
        torus(f'{prefix}_Inset', radius * 0.62, radius * 0.07, location, rotation, GRAPHITE),
    ]
    for part in parts:
        part.parent = rig
    return [rig, *parts]


def maze_port(prefix, normal, distance=1.08, radius=0.39):
    normal = Vector(normal).normalized()
    tangent = normal.cross(Vector((0, 0, 1)))
    if tangent.length < 0.1:
        tangent = normal.cross(Vector((0, 1, 0)))
    tangent.normalize()
    bitangent = normal.cross(tangent).normalized()
    center = normal * distance
    objects = []
    frame = polygon_loop(f'{prefix}_PortFrame', center, normal, radius, 6, 0.065, SILVER, math.pi / 6)
    objects.append(frame)
    backing = uv_sphere(f'{prefix}_PortBacking', radius * 0.88, center - normal * 0.025, GRAPHITE, 24, 12)
    backing.scale = (1, 1, 0.18)
    orient_to_normal(backing, normal)
    objects.append(backing)
    pattern = (
        (-0.24, -0.19, 0.23, 0.035), (-0.05, -0.19, 0.035, 0.17),
        (0.12, -0.19, 0.16, 0.035), (-0.23, -0.05, 0.035, 0.17),
        (-0.08, -0.04, 0.18, 0.035), (0.19, -0.03, 0.035, 0.18),
        (-0.23, 0.12, 0.17, 0.035), (-0.05, 0.12, 0.035, 0.16),
        (0.10, 0.12, 0.20, 0.035), (0.24, 0.02, 0.035, 0.13),
    )
    for index, (x, y, sx, sy) in enumerate(pattern):
        position = center + tangent * x + bitangent * y + normal * 0.035
        bar = cube(f'{prefix}_Maze_{index:02d}', (sx, sy, 0.025), position, mat=ICE, bevel=0.018)
        orient_to_normal(bar, normal)
        objects.append(bar)
    return objects


def honeycomb_patch(prefix, normal, distance=1.1, cell_radius=0.13):
    normal = Vector(normal).normalized()
    tangent = normal.cross(Vector((0, 0, 1)))
    if tangent.length < 0.1:
        tangent = normal.cross(Vector((0, 1, 0)))
    tangent.normalize()
    bitangent = normal.cross(tangent).normalized()
    center = normal * distance
    offsets = [(0, 0)]
    for index in range(6):
        angle = math.tau * index / 6
        offsets.append((math.cos(angle) * cell_radius * 1.78, math.sin(angle) * cell_radius * 1.78))
    objects = [polygon_loop(f'{prefix}_Boundary', center, normal, cell_radius * 3.15, 6, 0.045, BRONZE, math.pi / 6)]
    for index, (x, y) in enumerate(offsets):
        cell_center = center + tangent * x + bitangent * y + normal * 0.025
        objects.append(polygon_loop(
            f'{prefix}_Cell_{index:02d}', cell_center, normal, cell_radius, 6, 0.018, SILVER, math.pi / 6
        ))
    return objects


def wire_cage(name, radius, mat=MINT, subdivisions=2, thickness=0.018):
    obj = ico(name, radius, mat=mat, subdivisions=subdivisions)
    wire = obj.modifiers.new('Geodesic struts', 'WIREFRAME')
    wire.thickness = thickness
    wire.use_replace = True
    return obj


def orbit_satellites(prefix, major=2.05, count=8, tilt=(0.55, 0.2, 0.15)):
    orbit = torus(f'{prefix}_OrbitRail', major, 0.022, rotation=tilt, mat=BRONZE)
    rig = empty(f'{prefix}_OrbitRig')
    rig.rotation_euler = tilt
    objects = [orbit, rig]
    for i in range(count):
        a = math.tau * i / count
        satellite = uv_sphere(
            f'{prefix}_Satellite_{i:02d}',
            0.075 + 0.026 * (i % 3),
            (major * math.cos(a), major * math.sin(a), 0),
            SILVER if i % 3 else ICE,
            16,
            8,
        )
        satellite.parent = rig
        objects.append(satellite)
    return objects


def maze_band(prefix, radius=1.28, rows=5, segments=18):
    objects = []
    for row in range(rows):
        z = (row - (rows - 1) / 2) * 0.17
        ring_r = math.sqrt(max(radius * radius - z * z, 0.1))
        for i in range(segments):
            if (i + row * 3) % 5 == 0:
                continue
            a = math.tau * i / segments
            loc = (ring_r * math.cos(a), ring_r * math.sin(a), z)
            objects.append(cube(
                f'{prefix}_Circuit_{row:02d}_{i:02d}',
                (0.115 + 0.025 * ((i + row) % 2), 0.035, 0.045),
                loc, (0, 0, a + math.pi / 2), SILVER, 0.014
            ))
            if (i + row) % 3 == 0:
                objects.append(cube(
                    f'{prefix}_CircuitJoint_{row:02d}_{i:02d}',
                    (0.035, 0.035, 0.105),
                    loc, (0, 0, a + math.pi / 2), BRONZE, 0.012
                ))
    return objects


def model_orbital_maze():
    objs = [uv_sphere('Maze_Core', 1.18, mat=GRAPHITE, segments=40, rings=20)]
    top = uv_sphere('Maze_TopShell', 1.2, (0, 0, 0.47), SILVER, 40, 20)
    top.scale.z = 0.62
    bottom = uv_sphere('Maze_BottomShell', 1.2, (0, 0, -0.53), SILVER, 40, 20)
    bottom.scale.z = 0.56
    objs += [top, bottom]
    objs += shell_meridians('MazeTop', 1.215, 9, True)
    objs += shell_meridians('MazeBottom', 1.205, 7, False)
    objs += maze_band('Maze', 1.25, 6, 22)
    objs += maze_traces('Maze', 1.285, 16)
    objs += [
        torus('Maze_Equator', 1.31, 0.045, mat=BRONZE),
        torus('Maze_Polar_Ring', 1.48, 0.032, rotation=(math.pi / 2, 0.25, 0), mat=SILVER),
        wire_cage('Maze_Outer_Cage', 1.7, GRAPHITE, 2, 0.012),
        torus('Maze_CapGrooveA', 0.72, 0.025, (0, 0, 1.02), mat=GRAPHITE),
        torus('Maze_CapGrooveB', 0.46, 0.018, (0, 0, 1.13), mat=BRONZE),
        torus('Maze_ShellSeamTop', 1.12, 0.018, (0, 0, 0.28), mat=GRAPHITE),
        torus('Maze_ShellSeamBottom', 1.1, 0.018, (0, 0, -0.34), mat=GRAPHITE),
    ]
    objs += orbit_satellites('Maze', 1.95, 10, (0.65, 0.2, 0.2))
    objs += [
        cylinder('Maze_PedestalBase', 0.84, 0.16, (0, 0, -2.09), GRAPHITE),
        torus('Maze_PedestalOuter', 0.86, 0.095, (0, 0, -2.02), mat=SILVER),
        torus('Maze_PedestalInner', 0.67, 0.025, (0, 0, -1.96), mat=BRONZE),
        torus('Maze_PedestalGroove', 0.76, 0.015, (0, 0, -2.12), mat=GRAPHITE),
    ]
    return objs


def model_stacked_rings():
    objs = []
    for level, z in enumerate((-0.72, 0, 0.72)):
        level_rig = empty(f'RingStack_LevelRig_{level}')
        objs.append(level_rig)
        phase = 0.45 * level
        level_parts = [
            arc_ring(f'RingStack_OuterArc_{level}', 1.02, 0.13, phase + 0.2, phase + math.tau - 0.72, z, mat=SILVER),
            arc_ring(f'RingStack_InnerArc_{level}', 0.79, 0.028, phase + 0.2, phase + math.tau - 0.72, z, mat=BRONZE),
        ]
        for i in range(8):
            a = phase + 0.35 + i * (math.tau - 1.0) / 8
            level_parts.append(cube(
                f'RingStack_Panel_{level}_{i}', (0.055, 0.16, 0.105),
                (0.91 * math.cos(a), 0.91 * math.sin(a), z), (0, 0, a), GRAPHITE, 0.018
            ))
        for part in level_parts:
            part.parent = level_rig
        objs += level_parts
    for level in range(2):
        objs.append(cylinder_between(f'RingStack_Spine_{level}', (0.98, 0.18, -0.65), (0.98, 0.18, 0.65), 0.055, BRONZE))
    objs.append(uv_sphere('RingStack_Satellite', 0.2, (1.42, -0.9, -0.82), SILVER, 20, 10))
    objs.append(torus('RingStack_SatelliteBand', 0.215, 0.025, (1.42, -0.9, -0.82), (0.4, 0.2, 0), BRONZE))
    return objs


def model_paneled_core():
    objs = [ico('Panel_Core', 1.16, mat=SILVER, subdivisions=3)]
    directions = [(1, 0.1, 0.2), (-1, -0.05, 0.05), (0.1, 1, 0.25), (-0.1, -1, -0.15), (0.15, 0.1, 1)]
    for i, direction in enumerate(directions):
        objs += maze_port(f'Panel_{i}', direction, 1.08, 0.38)
    objs += [
        wire_cage('Panel_FrameShell', 1.2, GRAPHITE, 1, 0.065),
        torus('Panel_StructuralBand_A', 1.21, 0.045, rotation=(0.7, 0.15, 0.25), mat=GRAPHITE),
        torus('Panel_StructuralBand_B', 1.21, 0.045, rotation=(-0.55, 0.3, -0.28), mat=BRONZE),
    ]
    objs += orbit_satellites('Panel', 1.62, 6, (0.9, 0.4, -0.2))
    objs += [cube('Panel_Pod_A', (0.18, 0.28, 0.45), (1.55, -0.55, -0.85), (0.1, 0.3, -0.25), SILVER, 0.12),
             cube('Panel_Pod_B', (0.28, 0.1, 0.42), (-1.48, 0.72, -0.65), (-0.2, 0.2, 0.4), SILVER, 0.11)]
    return objs


def model_shield_orb():
    core = cube('Shield_Core', (0.95, 0.72, 1.05), mat=GRAPHITE, bevel=0.3)
    objs = [core]
    objs += [
        torus('Shield_Ring_A', 1.36, 0.1, rotation=(0.82, 0.15, 0.2), mat=SILVER),
        torus('Shield_Ring_B', 1.32, 0.06, rotation=(-0.62, 0.25, -0.3), mat=BRONZE),
        wire_cage('Shield_Lattice', 1.17, SILVER, 3, 0.02),
    ]
    for i in range(4):
        a = i * math.pi / 2 + 0.3
        objs.append(cube(f'Shield_Rib_{i}', (0.08, 0.08, 1.28),
                         (0, 0, 0), (0.45 * math.sin(a), 0.45 * math.cos(a), a), BRONZE))
    return objs


def model_geodesic_core():
    objs = [uv_sphere('Geo_Core', 1.08, mat=GRAPHITE, segments=36, rings=18),
            wire_cage('Geo_Cage', 1.46, SILVER, 2, 0.052)]
    for index, normal in enumerate(((0, -1, 0.15), (0.72, -0.62, 0.25), (-0.68, -0.66, -0.12))):
        objs += honeycomb_patch(f'GeoPanel_{index}', normal, 1.1, 0.115)
    for i in range(12):
        a = math.tau * i / 12
        z = 0.42 * math.sin(a * 3)
        objs.append(uv_sphere(f'Geo_Node_{i:02d}', 0.075,
                              (1.46 * math.cos(a), 1.46 * math.sin(a), z), BRONZE, 14, 7))
    objs += orbit_satellites('Geo', 1.93, 4, (0.35, -0.4, 0.18))
    objs += ringed_satellite('Geo_LargeSatellite_A', (-1.85, -0.45, 0.2), 0.26, (0.3, 0.55, 0.2))
    objs += ringed_satellite('Geo_LargeSatellite_B', (1.72, 0.55, 0.62), 0.3, (-0.4, 0.3, 0.1))
    objs += ringed_satellite('Geo_LargeSatellite_C', (0.75, -1.7, -0.72), 0.28, (0.65, -0.2, 0.4))
    return objs


def export_model(name, objects):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    path = os.path.join(OUT, f'{name}.glb')
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT',
        export_animations=True,
    )
    return path


def animate_model(name, objects):
    layer_rig = None
    spin_rig = None
    if name == 'orbital-maze':
        layer_rig = empty('MazeBand_CounterRotation')
        for obj in objects:
            if obj.name.startswith('Maze_Circuit'):
                obj.parent = layer_rig
        objects.append(layer_rig)
        spin_rig = empty('MazeCore_MechanicalSpin')
        for obj in objects:
            if obj.parent is None and 'Pedestal' not in obj.name and 'Orbit' not in obj.name:
                obj.parent = spin_rig
        objects.append(spin_rig)
    elif name in {'paneled-core', 'shield-orb', 'geodesic-core'}:
        spin_rig = empty(f'{name}_MechanicalSpin')
        for obj in objects:
            independent_ring = name == 'shield-orb' and obj.name.startswith('Shield_Ring')
            if (
                obj.parent is None
                and 'Orbit' not in obj.name
                and 'Satellite' not in obj.name
                and not independent_ring
            ):
                obj.parent = spin_rig
        objects.append(spin_rig)

    root = bpy.data.objects.new(f'{name}_AnimatedRoot', None)
    bpy.context.collection.objects.link(root)
    for obj in objects:
        if obj.parent is None:
            obj.parent = root

    root.rotation_euler = (math.radians(-8), math.radians(10), math.radians(-7))
    root.location.z = -0.07
    root.keyframe_insert('rotation_euler', frame=1)
    root.keyframe_insert('location', frame=1)
    root.rotation_euler = (math.radians(-3), math.radians(24), math.radians(3))
    root.location.z = 0.08
    root.keyframe_insert('rotation_euler', frame=91)
    root.keyframe_insert('location', frame=91)
    root.rotation_euler = (math.radians(-8), math.radians(10), math.radians(-7))
    root.location.z = -0.07
    root.keyframe_insert('rotation_euler', frame=181)
    root.keyframe_insert('location', frame=181)

    if layer_rig:
        layer_rig.rotation_euler.z = 0
        layer_rig.keyframe_insert('rotation_euler', frame=1)
        layer_rig.rotation_euler.z = -math.tau * 0.62
        layer_rig.keyframe_insert('rotation_euler', frame=181)

    if spin_rig:
        spin_rig.rotation_euler = (0, 0, 0)
        spin_rig.keyframe_insert('rotation_euler', frame=1)
        spin_rig.rotation_euler = (0, 0, math.tau)
        spin_rig.keyframe_insert('rotation_euler', frame=181)

    for index, obj in enumerate(objects):
        is_driver = obj.parent is root
        if is_driver and ('Orbit' in obj.name or 'Ring' in obj.name or 'Cage' in obj.name):
            start = obj.rotation_euler.copy()
            obj.keyframe_insert('rotation_euler', frame=1)
            obj.rotation_euler.z = start.z + math.tau * (-1 if index % 2 else 1)
            obj.keyframe_insert('rotation_euler', frame=181)
        elif is_driver and ('Satellite' in obj.name or 'Node_' in obj.name):
            start = obj.location.copy()
            obj.keyframe_insert('location', frame=1)
            obj.location.z = start.z + 0.18
            obj.keyframe_insert('location', frame=91)
            obj.location = start
            obj.keyframe_insert('location', frame=181)
        elif 'TopShell' in obj.name or 'BottomShell' in obj.name:
            start = obj.location.copy()
            direction = 1 if 'TopShell' in obj.name else -1
            obj.keyframe_insert('location', frame=1)
            obj.location.z = start.z + direction * 0.055
            obj.keyframe_insert('location', frame=91)
            obj.location = start
            obj.keyframe_insert('location', frame=181)

    return [root, *objects]


bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 181
bpy.context.scene.render.fps = 24

builders = [
    ('orbital-maze', model_orbital_maze),
    ('stacked-rings', model_stacked_rings),
    ('paneled-core', model_paneled_core),
    ('shield-orb', model_shield_orb),
    ('geodesic-core', model_geodesic_core),
]

gallery = []
gallery_roots = {}
for index, (name, builder) in enumerate(builders):
    objects = animate_model(name, builder())
    export_model(name, objects)
    gallery_root = empty(f'{name}_GalleryRoot', ((index - 2) * 4.3, 0, 0))
    objects[0].parent = gallery_root
    gallery_roots[name] = gallery_root
    gallery.extend(objects)

bpy.ops.object.camera_add(location=(0, -22, 8.5))
camera = bpy.context.object
camera.name = 'Gallery_Camera'
camera.data.lens = 48
direction = Vector((0, 0, 0.15)) - camera.location
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = camera

bpy.ops.object.light_add(type='AREA', location=(-5, -5, 8))
key = bpy.context.object
key.name = 'Aurora_Key'
key.data.energy = 1700
key.data.shape = 'DISK'
key.data.size = 7
key.data.color = (0.60, 0.86, 0.83)

bpy.ops.object.light_add(type='AREA', location=(6, -2, 4))
fill = bpy.context.object
fill.name = 'Aurora_Fill'
fill.data.energy = 1100
fill.data.size = 6
fill.data.color = (0.064, 0.393, 0.323)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1400
scene.render.resolution_y = 560
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = os.path.join(OUT, 'aurora-orbs-preview.png')
scene.world.color = (0.002, 0.022, 0.021)
scene.render.film_transparent = False
scene.frame_set(48)


def set_render_hidden(root, hidden):
    root.hide_render = hidden
    for child in root.children_recursive:
        child.hide_render = hidden

for name, root in gallery_roots.items():
    for other in gallery_roots.values():
        set_render_hidden(other, other is not root)
    target = root.matrix_world.translation + Vector((0, 0, 0.05))
    camera.location = target + Vector((4.5, -7.4, 3.8))
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.frame_set(48)
    scene.render.filepath = os.path.join(OUT, f'{name}-preview.png')
    bpy.ops.render.render(write_still=True)
    scene.render.resolution_x = 540
    scene.render.resolution_y = 540
    for frame in (1, 91, 181):
        scene.frame_set(frame)
        scene.render.filepath = os.path.join(OUT, f'{name}-motion-{frame:03d}.png')
        bpy.ops.render.render(write_still=True)

for root in gallery_roots.values():
    set_render_hidden(root, False)

orbital_root = gallery_roots['orbital-maze']
for other in gallery_roots.values():
    set_render_hidden(other, other is not orbital_root)
target = orbital_root.matrix_world.translation + Vector((0, 0, 0.05))
camera.location = target + Vector((4.5, -7.4, 3.8))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.resolution_x = 720
scene.render.resolution_y = 720
for frame in (1, 61, 121, 181):
    scene.frame_set(frame)
    scene.render.filepath = os.path.join(OUT, f'orbital-maze-motion-{frame:03d}.png')
    bpy.ops.render.render(write_still=True)

for root in gallery_roots.values():
    set_render_hidden(root, False)
scene.frame_set(48)
camera.location = (0, -22, 8.5)
camera.rotation_euler = (Vector((0, 0, 0.15)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.resolution_x = 1400
scene.render.resolution_y = 560
scene.render.filepath = os.path.join(OUT, 'aurora-orbs-preview.png')

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'aurora-orbs-source.blend'))
bpy.ops.render.render(write_still=True)
print(f'Created {len(builders)} models in {OUT}')
