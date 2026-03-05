import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "grimorio-validators",
    include: ["src/**/*.test.ts"],
  },
});
