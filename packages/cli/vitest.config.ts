import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "grimorio",
    include: ["src/**/*.test.ts"],
  },
});
