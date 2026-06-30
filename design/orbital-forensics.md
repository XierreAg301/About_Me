# Orbital Forensics — Current Website State

**Updated:** June 30, 2026  
**Status:** Implemented and passing lint/production build  
**Experience:** Cinematic intro → pinned globe → country targeting → orbital dive → constellation arrival → portfolio node network

## Current experience

1. **Original cinematic intro**
   - The command-prompt boot sequence and intro videos remain the first-visit experience.
   - Visitors can play the cinematic, control sound, or skip it.
   - The intro is shown once per browser session and hands focus directly to the five-pin globe navigation.

2. **Global signal field**
   - There is no intermediate “Enter the signal field” screen.
   - The cinematic intro drops directly into the completed globe, NASA catalog-derived star sky, orbiting station, and five visible country signals.
   - Decorative cloud bands have been removed from orbital space; clouds appear only during the descent.
   - Every reload selects exactly five countries from the country pool.
   - A country can only receive one signal, so all five locations are unique.
   - Every signal uses a polygon-validated interior country anchor instead of a capital or city coordinate.
   - Signals are available through both the 3D beacons and accessible country buttons.
   - The globe auto-rotates slowly and supports immediate pointer/touch dragging through a lightweight interaction proxy, plus visible left/right rotation controls.

3. **Country targeting and descent**
   - Selecting a signal removes competing beacons and the station, rotates the chosen country toward the camera, and establishes the approach vector.
   - The country readout sits away from the centered node and disappears during the final descent.
   - The camera accelerates through the globe while generated velocity streaks and an atmosphere ring reinforce depth and speed.
   - Six staggered WebGL cumulonimbus layers cross the frame before a brief blackout.
   - The constellation emerges from deep space during a dedicated arrival beat; only then does the portfolio interface fade in.
   - Transition skip is an unboxed text action at the top right; `Esc` and `Space` provide equivalent keyboard controls.

4. **Portfolio node network**
   - Home, About, Skills, Background, Projects, Certificates, and Contact are represented as connected 3D nodes.
   - Selecting a node recenters the constellation and makes that node dominant.
   - The active node’s title and summary appear beside the 3D object.
   - “Decipher node” opens the existing portfolio content in a readable side record without leaving the scene.

## Implemented assets

| Source | Web output | Current use |
| --- | --- | --- |
| `Globe_Digital.blend` | `public/models/digital-globe.glb` | Main interactive globe |
| `space+station.glb` | `public/models/space-station-web.glb` | Orbiting station/satellite |
| Blender-generated geometry | `public/models/orbital-node.glb` | Country beacons and portfolio nodes |
| NASA Black Marble 2016 | `public/textures/nasa-black-marble-2016.jpg` | Georeferenced night-Earth surface |
| NASA Deep Star Maps 2020 | `public/textures/nasa-deep-star-map-2020.jpg` | Catalog-derived outer-space environment |
| Cumulonimbus Field 6 VDB | `public/textures/cloud-field-6.png` | Retained derivative; no longer loaded in orbit |
| Cumulonimbus Field 4 VDB | Three `cloud-descent-*.png` frames | Atmospheric fly-through |

The reproducible Blender conversion and optimization pipeline is stored in `scripts/prepare_orbital_assets.py`.

## Globe repair and outline state

The downloaded continent shell was not a complete sphere: its geometry stopped before the north pole and exposed the black inner sphere as a large circular hole. The damaged outer shell has been replaced with a complete, higher-resolution UV sphere while retaining the inner grid layers. The marketplace model's stylized painted map is replaced at runtime with NASA Black Marble 2016, whose standard equirectangular projection matches the geographic border data.

Country geometry now uses the same standard latitude/longitude orientation as the repaired globe. The 50m `world-atlas` topology replaces the former coarse 110m data. `topojson-client` separates it into a brighter coastline layer and a quieter internal-border layer, both positioned flush against the surface. This keeps the outline hierarchy refined and aligned while the globe rotates, targets a country, or is viewed from either pole.

Drag input no longer ray-tests the detailed shell or approximately 80,000 coastline/border coordinates. An invisible 32×18 sphere receives pointer input, and the globe rotation is applied directly while dragging instead of trailing behind the pointer through easing.

## Changes from the original plan

- **The existing cinematic intro is preserved.** It now drops directly into the pinned globe rather than another entry screen.
- **The scene uses a hybrid Blender/WebGL workflow.** Blender prepares and optimizes assets; React Three Fiber controls runtime interaction, targeting, camera movement, and responsive behavior.
- **VDB clouds are pre-rendered.** Browsers cannot load the supplied OpenVDB sequences directly, so the actual volumes are rendered into transparent WebGL sprites used only during descent.
- **Outer space now uses a scientific reference.** NASA Goddard’s Deep Star Maps 2020 replaces the decorative orbital cloud bands.
- **The marketplace globe provides repaired geometry, not geography.** Its incomplete polar geometry and artistic source rotations are removed, while NASA Black Marble supplies an accurate surface.
- **Country outlines are data-driven.** They are no longer dependent on the damaged model’s decorative lines.
- **Outline quality now uses 50m topology.** Coastlines and internal borders have separate visual weights.
- **The five country nodes are randomized per reload.** Portfolio section nodes remain stable after the visitor enters the network.
- **Country pins use interior anchors.** All configured coordinates were checked against their matching country polygons.
- **The portfolio stays inside the 3D experience.** Existing panels open as decoded records rather than navigating to disconnected conventional pages.

## Revised implementation plan

- [x] Restore and retain the original cinematic intro.
- [x] Remove the redundant post-cinematic entry screen and open directly on the pins.
- [x] Prepare the downloaded globe, station, node, and VDB assets for the web.
- [x] Repair the globe’s missing polar cap and normalize its geographic orientation.
- [x] Add polished 50m coastlines and restrained internal country borders.
- [x] Replace the stylized source map with a georeferenced NASA Black Marble surface.
- [x] Move drag handling to a low-poly proxy and remove pointer-follow latency.
- [x] Generate five randomized signals on five unique countries.
- [x] Replace city coordinates with polygon-validated interior country anchors.
- [x] Add drag, touch, keyboard-accessible controls, and mobile layouts.
- [x] Animate country targeting, camera zoom, and cloud descent.
- [x] Restore the globe-to-node cinematic with velocity, cloud, blackout, and constellation-arrival beats.
- [x] Replace the cloudy orbital background with a NASA catalog-derived star environment.
- [x] Move transition controls to a top-right text action and add `Esc`/`Space` shortcuts.
- [x] Hide non-target beacons and the station during the country approach.
- [x] Build the interactive 3D portfolio constellation and decoder records.
- [x] Add WebGL loading/fallback handling and reduced-motion behavior.
- [x] Validate desktop and mobile flows in Microsoft Edge.
- [x] Validate a sustained desktop Edge drag at 60.0 fps with no console errors.
- [x] Validate the complete six-second cinematic at 59.97 fps in desktop Edge.
- [x] Split the 50m topology from the lazy WebGL bundle, reducing that chunk from about 1.62 MB to 0.86 MB.
- [x] Recompress the station from about 7.9 MB to 3.1 MB for slower mobile connections.
- [ ] Perform a final content pass once all portfolio copy and project records are considered complete.

## Visual direction

Orbital Forensics treats darkness as an active material: a calibrated star field where every illuminated edge carries meaning. The globe is the specimen, the atmosphere is encountered only during descent, and the node constellation is the decoded record. Mineral white and smoked steel establish the instrument-like atmosphere; amber appears only for human action and active state.

Scale supplies the narrative rhythm. The globe begins monumental and quiet, the cloud descent briefly overwhelms the frame, and the final constellation becomes intimate and analytical. Typography behaves as an annotation layer until a node is decoded, when the portfolio content becomes the evidence beside the object.

## Related documentation

- `README.md` — project overview, architecture, commands, deployment, and validation.
- `ASSETS.md` — active/legacy asset inventory and provenance status.
- `public/README.md` — browser-ready runtime asset guide and regeneration notes.
