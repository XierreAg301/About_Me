import bpy
import os
from mathutils import Vector


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'models', 'aurora-orbs')
scene = bpy.context.scene


def set_tree_hidden(root, hidden):
    root.hide_render = hidden
    for child in root.children_recursive:
        child.hide_render = hidden


gallery_roots = [obj for obj in scene.objects if obj.name.endswith('_GalleryRoot')]
orbital_root = scene.objects.get('orbital-maze_GalleryRoot')
if orbital_root is None:
    raise RuntimeError('orbital-maze_GalleryRoot was not found in the Blender source')

for root in gallery_roots:
    set_tree_hidden(root, root is not orbital_root)

camera = scene.objects.get('Gallery_Camera')
target = orbital_root.matrix_world.translation + Vector((0, 0, 0.05))
camera.location = target + Vector((4.5, -7.4, 3.8))
camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 52
scene.camera = camera

scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 360
scene.render.resolution_y = 360
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 181
frames = os.path.join(os.environ['TEMP'], 'aurora-animation-frames')
os.makedirs(frames, exist_ok=True)
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = os.path.join(frames, 'frame-')

bpy.ops.render.render(animation=True)
print(f'Rendered animation frames to {frames}')
