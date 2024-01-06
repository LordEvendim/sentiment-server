/// <reference types="vitest" />

import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "#config", replacement: path.resolve(__dirname, "./src/config") },
      {
        find: "#controller",
        replacement: path.resolve(__dirname, "./src/controller"),
      },
      { find: "#dao", replacement: path.resolve(__dirname, "./src/dao") },
      { find: "#mocks", replacement: path.resolve(__dirname, "./src/mocks") },
      {
        find: "#modules",
        replacement: path.resolve(__dirname, "./src/modules"),
      },
      { find: "#routes", replacement: path.resolve(__dirname, "./src/routes") },
      { find: "#types", replacement: path.resolve(__dirname, "./src/types") },
      { find: "#utils", replacement: path.resolve(__dirname, "./src/utils") },
    ],
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
  },
});
