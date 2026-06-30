# Public Runtime Assets

**Updated:** June 30, 2026

Vite copies this directory into the build output without transforming its contents. Files here are browser-ready runtime derivatives; source Blender/VDB marketplace downloads are intentionally kept outside the repository.

The application enters the five-pin globe state immediately after the cinematic intro. Orbital space uses the NASA catalog-derived star map below, while a NASA Black Marble map provides the georeferenced Earth surface; decorative cloud sprites are no longer loaded around the globe.

## Active assets

```text
public/
├── media/
│   ├── intro.mp4
│   └── light-speed-transition.mp4
├── models/
│   ├── digital-globe.glb
│   ├── orbital-node.glb
│   └── space-station-web.glb
└── textures/
    ├── nasa-deep-star-map-2020.jpg
    ├── nasa-black-marble-2016.jpg
    ├── cloud-field-6.png
    ├── cloud-descent-01.png
    ├── cloud-descent-02.png
    └── cloud-descent-03.png
```

| File | Runtime role |
| --- | --- |
| `media/intro.mp4` | Original cinematic intro |
| `media/light-speed-transition.mp4` | Intro exit transition |
| `models/digital-globe.glb` | Repaired interactive globe |
| `models/space-station-web.glb` | Optimized orbiting station |
| `models/orbital-node.glb` | Reusable country and portfolio node |
| `textures/nasa-black-marble-2016.jpg` | NASA Black Marble 2016 georeferenced globe surface |
| `textures/nasa-deep-star-map-2020.jpg` | NASA Deep Star Maps 2020 environment background |
| `textures/cloud-descent-*.png` | Three VDB-rendered frames reused as six staggered atmospheric descent layers |

## Legacy files

- `models/hacker-earth.glb` — previous NASA-derived globe; no longer loaded.
- `models/globe-kit.glb` — earlier globe experiment; no longer loaded.
- `textures/cloud-field-6.png` — retained VDB derivative; no longer loaded in orbital space.

They remain available for comparison or rollback but are not part of the current scene.

## Runtime references

Always prefix public paths with `import.meta.env.BASE_URL`:

```js
const modelUrl = `${import.meta.env.BASE_URL}models/digital-globe.glb`;
```

This keeps assets working under both:

- GitHub Pages: `/About_Me/`
- Vercel: `/`

## Regeneration

The current web models and cloud sprites are produced by:

```text
scripts/prepare_orbital_assets.py
```

Run that script through Blender 5.1 in background mode after confirming its source paths. It repairs the globe shell, optimizes the station, builds the orbital node, renders the VDB cloud sprites, and exports the public derivatives. The NASA star and Earth maps are maintained separately from the marketplace-asset pipeline.

Do not manually edit the generated GLB or PNG files; update the Blender pipeline and regenerate them instead.
