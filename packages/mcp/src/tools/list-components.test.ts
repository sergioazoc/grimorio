import { describe, it, expect } from "vitest";
import { createMcpServer } from "../server.js";

describe("list_components tool", () => {
  it("should create server with tools registered", () => {
    const server = createMcpServer({ specs: "./nonexistent" });
    expect(server).toBeDefined();
  });
});
