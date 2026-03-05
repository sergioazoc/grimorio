import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "grimorio-analyzers",
    include: ["src/**/*.test.ts"],
  },
});
