/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: resolve("./src/index.ts"),
      name: "vc2c",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "typescript",
        "prettier",
        "prettier-eslint",
        "node:path",
        "node:fs",
      ],
    },
  },
  plugins: [dtsPlugin()],
  test: {
    coverage: {
      provider: "v8",
      exclude: [
        "dist",
        "bin",
        "demo",
        "coverage",
        "tests",
        "eslint.config.js",
        "vite.config.ts",
        "vite-demo.config.ts",
      ],
    },
  },
});
