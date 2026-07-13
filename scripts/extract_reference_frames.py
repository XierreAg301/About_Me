import bpy
import os


video = os.path.join(os.environ['TEMP'], 'pinterest-compit.mp4')
output = os.path.join(os.environ['TEMP'], 'compit-reference-frames')
os.makedirs(output, exist_ok=True)

scene = bpy.context.scene
scene.sequence_editor_create()
strip = scene.sequence_editor.strips.new_movie('CompIT reference', video, channel=1, frame_start=1)
scene.render.resolution_x = strip.elements[0].orig_width
scene.render.resolution_y = strip.elements[0].orig_height
scene.render.resolution_percentage = 50
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False

duration = strip.frame_final_duration
for index, factor in enumerate((0.0, 0.12, 0.24, 0.36, 0.48, 0.60, 0.72, 0.84, 0.96)):
    scene.frame_set(1 + int((duration - 1) * factor))
    scene.render.filepath = os.path.join(output, f'frame-{index:02d}.png')
    bpy.ops.render.render(write_still=True, use_viewport=False)

print(f'Extracted {duration} frame reference to {output}')
