import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDefaultTokens, TokenFileSchema } from "grimorio-core";

const TEST_DIR = join(import.meta.dirname, "__test_init__");

describe("init command", () => {
  const originalCwd = process.cwd();

  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it("should create grimorio.config.ts", async () => {
    const { default: initCommand } = await import("./init.js");
    await initCommand.run!({ args: {} } as any);

    const configPath = join(TEST_DIR, "grimorio.config.ts");
    expect(existsSync(configPath)).toBe(true);

    const content = await readFile(configPath, "utf-8");
    expect(content).toContain("specs:");
    expect(content).toContain("tokens:");
    expect(content).toContain("components:");
    expect(content).toContain("validation:");
  });

  it("should create specs/ directory", async () => {
    const { default: initCommand } = await import("./init.js");
    await initCommand.run!({ args: {} } as any);

    expect(existsSync(join(TEST_DIR, "specs"))).toBe(true);
  });

  it("should create tokens.json with valid default tokens", async () => {
    const { default: initCommand } = await import("./init.js");
    await initCommand.run!({ args: {} } as any);

    const tokensPath = join(TEST_DIR, "tokens.json");
    expect(existsSync(tokensPath)).toBe(true);

    const content = JSON.parse(await readFile(tokensPath, "utf-8"));
    const result = TokenFileSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it("should produce tokens matching getDefaultTokens()", async () => {
    const { default: initCommand } = await import("./init.js");
    await initCommand.run!({ args: {} } as any);

    const tokensPath = join(TEST_DIR, "tokens.json");
    const content = JSON.parse(await readFile(tokensPath, "utf-8"));
    expect(content).toEqual(getDefaultTokens());
  });

  it("should not overwrite existing config", async () => {
    const configPath = join(TEST_DIR, "grimorio.config.ts");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(configPath, "// existing config\n");

    const { default: initCommand } = await import("./init.js");
    await initCommand.run!({ args: {} } as any);

    const content = await readFile(configPath, "utf-8");
    expect(content).toBe("// existing config\n");
  });
});
