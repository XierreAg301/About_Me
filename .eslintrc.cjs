module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'Tools', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // This is a personal portfolio, not a typed library: prop-types adds noise
    // without value here.
    'react/prop-types': 'off',
    // React Three Fiber extends JSX with Three.js element props (args, wireframe,
    // transparent, depthWrite, ...) that this rule cannot recognize.
    'react/no-unknown-property': 'off',
  },
}
