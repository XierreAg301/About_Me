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
| Blue Marble 2048 | Cyber-world surface map | Freely available to the public | [NASA Visible Earth](https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice) |

The remaining scene assets are original procedural work:

- Brushed-steel grain: inline SVG `feTurbulence` filter (`--metal-grain` token).
- Starfield, grid, scanlines, and gradient meshes: CSS gradients.
- Globe wireframe, orbit rails, node gems, links, and packets: Three.js
  procedural geometry and shader materials.

Additional downloaded assets should come from verified public-domain or CC0
libraries such as [Poly Haven](https://polyhaven.com) or
[ambientCG](https://ambientcg.com), with their source recorded here.
