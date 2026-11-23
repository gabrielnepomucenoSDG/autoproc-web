/// <reference types="vitest/config" />
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function resolveCommitHash(): string {
  if (process.env.VITE_COMMIT_HASH) {
    return process.env.VITE_COMMIT_HASH;
  }
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __APP_COMMIT_HASH__: JSON.stringify(resolveCommitHash()),
  },
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // plugin-react v6 no longer runs Babel itself: the React Compiler is a
    // separate Babel pass. The Rust (`compiler: true`) path is experimental,
    // so we stay on Babel.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "eslint-rules/**/*.test.ts"],
  },
});
