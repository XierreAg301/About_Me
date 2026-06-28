# Static assets (`public/`)

Vite copies this directory to the build output without transforming its files.

## Current assets

- `media/intro.mp4` — optimized cinematic source and soundtrack.
- `media/light-speed-transition.mp4` — optimized light-speed transition.

The portfolio world is procedural and its non-WebGL mode uses CSS/SVG, so it
does not require texture or fallback-image directories.

Prefix runtime references with `import.meta.env.BASE_URL` so assets resolve on
both Vercel (`/`) and GitHub Pages (`/About_Me/`).
