# Aurora Mechanical Orbs

Five original Blender 5.1 assets modeled from the supplied mechanical-orb reference:

- `orbital-maze.glb` — segmented shell, circuit band, wire cage, orbiting satellites, and pedestal.
- `paneled-core.glb` — faceted shell with polygonal maze ports, structural bands, and external pods.
- `stacked-rings.glb` — three broken mechanical rings with inset rails and bridge panels.
- `shield-orb.glb` — rounded core, triangular lattice, ribs, and crossing shield rings.
- `geodesic-core.glb` — geodesic outer frame, honeycomb inserts, and satellite system.

Each GLB contains a seamless 181-frame animation at 24 fps (7.5 seconds). Animation layers include floating, mechanical rotation, counter-rotation, orbit rigs, and satellite motion. The primary model keeps its pedestal in a separate hierarchy so it remains below the rotating assembly.

The Blender source, preview renders, motion checkpoints, and review video are generated locally and excluded from Git history. Regenerate them with:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' --background --python scripts\build_aurora_orbs.py
```

The generated `*-preview.png` files show isolated models. `orbital-maze-motion-*.png` provides four checkpoints for checking loop continuity and mechanical separation.

`orbital-maze-animation.mp4` is a 360px H.264 review render of the complete 7.54-second loop. It is intended for local motion review; the committed GLB files are the runtime assets.
