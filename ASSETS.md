# Assets & Licensing

All visual assets in this portfolio are free for commercial use. The site
favors procedural assets so the 3D world stays lightweight and distinctive.

## Fonts

| Font | Role | License | Source |
|------|------|---------|--------|
| Chakra Petch | Display / headings (HUD) | SIL Open Font License 1.1 | Google Fonts |
| Inter | Body / UI | SIL Open Font License 1.1 | Google Fonts |
| Cascadia Code | Monospace / system labels | SIL Open Font License 1.1 | self-hosted `assets/fonts/` |

Chakra Petch and Inter load from Google Fonts via `index.html`. Cascadia Code
is self-hosted for the terminal and system typography.

## Icons

| Set | Usage | License |
|-----|-------|---------|
| Lucide | Outline UI icons (mail, phone, shield, server, CPU, etc.) | ISC |
| Simple Icons | Brand glyphs (GitHub, LinkedIn, X, Facebook) | CC0 1.0 |

Icons are inlined as SVG paths in `src/components/Icon.jsx`; no icon-font or
additional runtime dependency is shipped.

## Textures, backgrounds & 3D materials

The scene is primarily procedural. One public NASA image supplies subtle
geographic detail on the connected-world globe:

| Asset | Usage | License / availability | Source |
|-------|-------|------------------------|--------|
| Blue Marble Next Generation 5400×2700 | Red/silver cyber-world surface map embedded in the GLB | Freely available to the public; credit NASA Earth Observatory | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/) |
| NASA Earth 3D printable model | Base relief mesh for the interactive globe | Free to download and use under NASA media guidelines | [NASA 3D Resources](https://science.nasa.gov/3d-resources/earth/) |

The NASA Earth STL was imported into Blender 5.1, reduced from 4,063,232 to
90,000 faces, UV projected, shaded with a red/silver version of the map, and exported
with a wire shell and orbit geometry as `public/models/hacker-earth.glb`.

The remaining scene assets are original procedural work:

- Brushed-steel grain: inline SVG `feTurbulence` filter (`--metal-grain` token).
- Starfield, grid, scanlines, and gradient meshes: CSS gradients.
- Globe wireframe, orbit rails, node gems, links, and packets: Three.js
  procedural geometry and shader materials.

Additional downloaded assets should come from verified public-domain or CC0
libraries such as [Poly Haven](https://polyhaven.com) or
[ambientCG](https://ambientcg.com), with their source recorded here.
