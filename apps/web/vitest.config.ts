import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@fairdev/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      "@fairdev/shared/*": path.resolve(__dirname, "../../packages/shared/src/*"),
    },
  },
});