import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['ts/index.ts'],
  format: ['esm', 'iife'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
});
