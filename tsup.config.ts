import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/curves/ed25519.ts', 'src/curves/secp256k1.ts', 'src/curves/nist256p1.ts', 'src/curves/curve25519.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
});
