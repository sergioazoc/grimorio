import { describe, it, expect } from "vitest";
import { createMcpServer } from "../server.js";

describe("validate_usage tool", () => {
  it("should create server with validate tool", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });
});
