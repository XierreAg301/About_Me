import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Vercel serves at the domain root, so assets must resolve from '/'. GitHub
// Pages still serves the project under '/About_Me/'. Vercel sets VERCEL=1 during
// its build, so we pick the right base per target and keep both deployments working.
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/About_Me/',
})