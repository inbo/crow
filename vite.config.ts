/// <reference types="vitest/config" />
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // URL_PREFIX comes from .env / .env.local (CI writes "/crow/" for GitHub Pages).
  // An empty prefix means "served from the root": Vite would read "" as a relative
  // base and give "./" as BASE_URL, which breaks the copied URL built from it.
  const env = loadEnv(mode, process.cwd(), "");

  // Pin the time zone the tests run in. It must be set here, before Vitest starts
  // its workers: they inherit this process's environment, and setting TZ inside a
  // spec has no effect on Date. d3 time axes and moment's local time follow it.
  // A TZ given explicitly is kept (npm run test:unit uses that for the A6 tests).
  if (mode === "test" && !process.env.TZ) process.env.TZ = "Europe/Brussels";

  return {
    base: env.URL_PREFIX || "/",
    plugins: [vue()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    define: {
      __COMMIT_HASH__: JSON.stringify(execSync("git rev-parse --short HEAD").toString()),
    },
    build: {
      outDir: "docs",
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["tests/unit/setup.ts"],
      include: ["tests/unit/**/*.spec.[jt]s?(x)"],
      // The real-data tests load and process whole days of vol2bird files and take
      // 2-3 s each locally; on shared CI runners they can exceed the defaults.
      testTimeout: 30000,
      // The render specs load and draw a whole scenario in beforeAll: the 72 h one
      // takes just over 30 s (as it did under Jest).
      hookTimeout: 60000,
    },
  };
});
