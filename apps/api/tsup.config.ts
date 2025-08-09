import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/http/server.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ['cjs'],
  target: 'node18',
  external: ['@prisma/client'],
})
