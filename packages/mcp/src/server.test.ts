import { describe, it, expect } from "vitest";
import { createMcpServer } from "./server.js";

describe("createMcpServer", () => {
  it("should create a server instance", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });

  it("should create server with config", () => {
    const server = createMcpServer({
      specs: "./specs/**/*.json",
      tokens: "./tokens.json",
    });
    expect(server).toBeDefined();
  });
});
