# Static assets (`public/`)

Vite copies everything in this folder to the build output root as-is (no hashing,
no transforms). Use it for large or pre-optimized assets that are referenced by
URL rather than imported into JS/CSS.

## Folder convention

- `media/` — compressed intro video and other heavy media (e.g. `intro.mp4`, poster images).
- `textures/` — 3D textures, environment maps, and sprite atlases for the R3F scenes.
- `fallbacks/` — static images shown when WebGL is unavailable or `prefers-reduced-motion` is set.

## Referencing these files

Asset URLs are relative to the deploy base path, which differs per target
(`/` on Vercel, `/About_Me/` on GitHub Pages — see `vite.config.js`). Always
prefix runtime references with the base URL so both deployments resolve correctly:

```js
const introSrc = `${import.meta.env.BASE_URL}media/intro.mp4`
```

Keep source/uncompressed originals out of this folder — only commit
deploy-ready, optimized assets here.
