import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./apps/web/src/test-setup.ts"],
    include: ["apps/**/*.{test,spec}.{ts,tsx}"],
  },
});
