import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "grimorio-mcp",
    include: ["src/**/*.test.ts"],
  },
});
