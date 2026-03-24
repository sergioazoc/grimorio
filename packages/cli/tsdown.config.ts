import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/main.ts"],
  format: "esm",
  dts: true,
  deps: {
    alwaysBundle: ["grimorio-core", "grimorio-analyzers", "grimorio-validators", "grimorio-mcp"],
  },
});
