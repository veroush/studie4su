import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    // Only load the Cloudflare Workers emulator (workerd) for production
    // builds/deploys, not local `vite dev`. Prisma's generated client
    // currently crashes inside workerd during local dev — WASM compile
    // errors on Prisma 7 (prisma/prisma#28657), "module is not defined"
    // (CJS/ESM mismatch) on Prisma 6.19 with the classic generator. Local
    // dev runs as plain Node instead, sidestepping both. Actual Cloudflare
    // Workers deploy compatibility is a separate problem to revisit later.
    ...(command === 'build' ? [cloudflare({ viteEnvironment: { name: 'ssr' } })] : []),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config
