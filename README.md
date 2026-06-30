# Aaron Austin C. Amaro — Orbital Portfolio

An immersive portfolio built with React, Vite, Three.js, and React Three Fiber. The current experience combines the original cinematic command-prompt intro with an interactive digital globe, randomized country signals, an atmospheric descent, and a connected 3D portfolio network.

**Current state:** Implemented and passing lint and production build as of June 30, 2026.

## Experience flow

1. **Cinematic intro** — the original boot sequence, intro video, sound control, and skip action.
2. **Signal field** — the intro drops directly into the interactive globe, five unique country pins, and a NASA catalog-derived star sky.
3. **Targeting** — choosing a country removes scene distractions, centers its interior anchor, and establishes the cinematic approach vector.
4. **Atmospheric descent** — the camera accelerates through the globe, velocity streaks and staggered VDB cloud waves cross the frame, and the scene briefly blacks out.
5. **Constellation arrival** — the portfolio nodes emerge from deep space before the interface fades in.
6. **Node network** — Home, About, Skills, Background, Projects, Certificates, and Contact become connected interactive 3D nodes.
7. **Decoded record** — selecting “Decipher node” opens the existing semantic portfolio panel beside the active node.

## Current features

- Complete repaired digital globe with a georeferenced NASA Black Marble surface, higher-detail 50m coastlines, and restrained internal borders.
- NASA Goddard Deep Star Maps 2020 background based on Hipparcos, Tycho-2, and Gaia DR2 catalogs.
- No decorative cloud sprites in orbital space; VDB clouds appear only during descent.
- Immediate pointer/touch rotation through a low-poly interaction proxy, slow auto-rotation, and visible rotation controls.
- Exactly five randomized nodes with no duplicated country.
- Every country pin uses a polygon-validated interior anchor rather than a capital or unrelated city coordinate.
- Blender-prepared globe, space-station, node, and cloud assets.
- A four-beat cinematic transition: country lock, orbital dive, layered cloud/velocity pass, and constellation arrival.
- Minimal top-right transition skip, plus `Esc` and `Space` keyboard shortcuts.
- Responsive desktop and mobile layouts with 48px touch targets.
- Reduced-motion handling, loading UI, and a no-WebGL fallback.
- Lazy-loaded 3D runtime with separately cached 50m country topology.
- Re-optimized 3.1 MB station asset; semantic portfolio content remains accessible in the decoder.
- GitHub Pages and Vercel base-path support.

## Technology

- React 18
- Vite 5
- Three.js
- React Three Fiber
- TopoJSON Client
- World Atlas
- Blender 5.1 asset-preparation pipeline

## Important files

| Path | Purpose |
| --- | --- |
| `src/components/IntroPortal.jsx` | Original cinematic intro |
| `src/app/PortfolioShell.jsx` | Experience phases, controls, node map, and decoder |
| `src/experience/PortfolioWorld.jsx` | WebGL scene, globe, station, clouds, and constellation |
| `src/experience/worldNodes.js` | Country pool and five-node randomization |
| `scripts/prepare_orbital_assets.py` | Reproducible Blender asset conversion |
| `design/orbital-forensics.md` | Current design state and revised implementation plan |
| `ASSETS.md` | Asset inventory, provenance, and license-status notes |
| `public/README.md` | Generated/runtime public asset guide |

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

The local GitHub Pages-style URL is:

```text
http://localhost:5173/About_Me/
```

## Deployment

Vite uses `/About_Me/` as the default base path for GitHub Pages. When the `VERCEL` environment variable is present, the base path changes to `/`.

Runtime public assets must be referenced through `import.meta.env.BASE_URL`; this is already applied to the intro media, GLB models, and cloud textures.

## Validation

The current flow has been checked in Microsoft Edge at desktop and mobile viewport sizes:

- Cinematic intro appears on the first visit and hands focus directly to the pinned globe navigation.
- No intermediate “Enter the signal field” screen remains.
- The globe has no missing polar cap.
- The NASA Earth surface and 50m coastlines/internal borders remain aligned across Asia while rotating and targeting.
- Every configured country anchor lies inside its matching World Atlas polygon.
- The detailed country topology loads as a separate cached asset instead of inflating the WebGL bundle.
- A sustained Edge drag test delivered 163 frames over 2.72 seconds (60.0 fps); decorative globe meshes and border lines are excluded from raycasting.
- The transition contains no “Atmospheric entry” label or centered skip button.
- Both `Esc` and `Space` complete the transition.
- The complete six-second cinematic transition sampled 59.97 fps in desktop Edge with no console errors.
- Five countries are unique and change after reload.
- Intro, globe, network, and decoder layouts do not create horizontal mobile overflow.
- Lint and production build pass.

Vite currently reports an advisory for the lazy 3D JavaScript chunk. It does not fail the build. Moving the 50m topology into a separate asset reduced the lazy WebGL chunk from roughly 1.62 MB to 0.86 MB before gzip.

## Documentation

- [Current design and plan](design/orbital-forensics.md)
- [Asset inventory and provenance](ASSETS.md)
- [Public runtime assets](public/README.md)
