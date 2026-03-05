import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "grimorio-core",
    include: ["src/**/*.test.ts"],
  },
});
