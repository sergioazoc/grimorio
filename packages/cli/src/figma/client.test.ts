import { describe, it, expect } from "vitest";
import { parseFigmaUrl } from "./client.js";

describe("parseFigmaUrl", () => {
  it("should parse a standard design URL", () => {
    const result = parseFigmaUrl("https://www.figma.com/design/ABC123/MyFile?node-id=1-234");
    expect(result).toEqual({ fileKey: "ABC123", nodeId: "1:234" });
  });

  it("should parse a design URL without node-id", () => {
    const result = parseFigmaUrl("https://www.figma.com/design/ABC123/MyFile");
    expect(result).toEqual({ fileKey: "ABC123", nodeId: undefined });
  });

  it("should parse a branch URL and use branchKey", () => {
    const result = parseFigmaUrl("https://www.figma.com/design/ABC123/branch/BRANCH456/MyFile");
    expect(result).toEqual({ fileKey: "BRANCH456", nodeId: undefined });
  });

  it("should parse a /file/ URL", () => {
    const result = parseFigmaUrl("https://www.figma.com/file/XYZ789/SomeFile?node-id=10-20");
    expect(result).toEqual({ fileKey: "XYZ789", nodeId: "10:20" });
  });

  it("should convert dashes to colons in node-id", () => {
    const result = parseFigmaUrl("https://www.figma.com/design/ABC/File?node-id=100-200");
    expect(result?.nodeId).toBe("100:200");
  });

  it("should return null for non-figma URLs", () => {
    expect(parseFigmaUrl("https://example.com/design/abc")).toBeNull();
  });

  it("should return null for invalid URLs", () => {
    expect(parseFigmaUrl("not-a-url")).toBeNull();
  });

  it("should return null for figma URL without fileKey", () => {
    expect(parseFigmaUrl("https://www.figma.com/design/")).toBeNull();
  });

  it("should handle URLs without www", () => {
    const result = parseFigmaUrl("https://figma.com/design/KEY123/File");
    expect(result).toEqual({ fileKey: "KEY123", nodeId: undefined });
  });
});
