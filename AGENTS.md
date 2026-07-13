# Repository Guidelines

## Project Structure & Module Organization

Application code lives in `src/`. `src/app/` owns navigation state and the portfolio shell, `src/components/` contains shared UI, `src/panels/` contains section content, `src/experience/` implements the Three.js/React Three Fiber world, and `src/hooks/` holds reusable browser hooks. Styles are grouped in `src/styles/`. Runtime models, textures, and videos belong under `public/`; source assets and fonts are under `assets/`. Asset-preparation utilities live in `scripts/`, while design decisions and provenance are documented in `design/`, `ASSETS.md`, and `public/README.md`. Production output in `dist/` is generated and must not be edited.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json` (Node 20 is used in CI).
- `npm run dev` starts Vite; the GitHub Pages-style route is `http://localhost:5173/About_Me/`.
- `npm run lint` checks all JavaScript and JSX with ESLint and permits no warnings.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built bundle for final browser checks.

## Coding Style & Naming Conventions

Follow the existing React style: two-space indentation, single quotes, semicolon-free JavaScript, and functional components. Use `PascalCase.jsx` for components and panels (`PortfolioShell.jsx`), `camelCase.js` for utilities and state modules, and `useName.js` for hooks. Keep scene logic in `src/experience/` and semantic content in panels. ESLint enforces React Hooks and React Refresh rules. Reference public assets with `import.meta.env.BASE_URL` so both GitHub Pages and Vercel deployments work.

## Testing Guidelines

There is currently no automated test framework or coverage threshold. Every change must pass `npm run lint` and `npm run build`. For visual or interaction changes, use `npm run preview` and manually verify the intro, globe navigation, keyboard controls, reduced-motion behavior, WebGL fallback, and mobile layout. Include regression details in the pull request.

## Commit & Pull Request Guidelines

History follows Conventional Commit-style subjects, primarily `feat:` and `fix:`. Write concise, imperative messages such as `fix: preserve globe focus on resize`. Pull requests should explain the user-visible change, list validation performed, and link related issues. Include before/after screenshots or a short recording for UI, animation, or 3D scene changes. Call out new asset sources, licenses, bundle-size impact, and deployment-path changes.

## Assets & Deployment

Do not commit secrets or local configuration. Record asset provenance and license status in `ASSETS.md`. GitHub Pages deploys `dist/` from `main` with the `/About_Me/` base; Vercel uses `/` when `VERCEL` is set.
