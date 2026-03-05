import { defineCommand } from "citty";
import consola from "consola";

export default defineCommand({
  meta: {
    name: "mcp:serve",
    description: "Start the MCP server for AI integration",
  },
  run: async () => {
    const { startServer } = await import("grimorio-mcp");
    const { resolveConfig } = await import("../config.js");

    const config = await resolveConfig();
    consola.info("Starting MCP server...");
    await startServer({
      ...config,
      tokens: typeof config.tokens === "string" ? config.tokens : undefined,
    });
  },
});
