import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/features/credit-calculator/services/**/*.ts",
        "src/features/credit-calculator/utils/**/*.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(here, "src"),
    },
  },
});