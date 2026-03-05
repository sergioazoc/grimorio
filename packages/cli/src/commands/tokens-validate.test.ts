import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  loadTokens,
  loadAllSpecs,
  flattenTokens,
  TokenFileSchema,
  getDefaultTokens,
} from "grimorio-core";
import type { TokenGroup } from "grimorio-core";

const TEST_DIR = join(import.meta.dirname, "__test_tokens_validate__");

const VALID_TOKENS: TokenGroup = {
  color: {
    $type: "color",
    primary: { $value: "#3b82f6", $type: "color" },
    deprecated: { $value: "#ff0000", $type: "color", $deprecated: true },
  },
  spacing: {
    $type: "dimension",
    md: { $value: "1rem", $type: "dimension" },
  },
};

const SPEC_WITH_TOKEN_REFS = {
  name: "Button",
  complexity: "simple",
  props: [{ name: "children", type: "ReactNode", required: true }],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {
    "root.backgroundColor": "{color.primary}",
    "root.padding": "{spacing.md}",
  },
  states: [],
  events: [],
  accessibility: { ariaAttributes: [], keyboardInteractions: [] },
  guidelines: [],
};

const SPEC_WITH_MISSING_REFS = {
  name: "Card",
  complexity: "simple",
  props: [],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {
    "root.backgroundColor": "{color.doesNotExist}",
    "root.border": "{border.width}",
  },
  states: [],
  events: [],
  accessibility: { ariaAttributes: [], keyboardInteractions: [] },
  guidelines: [],
};

const SPEC_WITH_DEPRECATED_REF = {
  name: "Alert",
  complexity: "simple",
  props: [],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {
    "root.color": "{color.deprecated}",
  },
  states: [],
  events: [],
  accessibility: { ariaAttributes: [], keyboardInteractions: [] },
  guidelines: [],
};

describe("tokens:validate command", () => {
  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(join(TEST_DIR, "specs"), { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it("should validate default tokens against schema", () => {
    const tokens = getDefaultTokens();
    const result = TokenFileSchema.safeParse(tokens);
    expect(result.success).toBe(true);
  });

  it("should validate valid tokens file", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(VALID_TOKENS, null, 2));

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const schemaResult = TokenFileSchema.safeParse(loadResult.value);
    expect(schemaResult.success).toBe(true);
  });

  it("should detect missing tokens referenced by specs", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(VALID_TOKENS, null, 2));
    await writeFile(
      join(TEST_DIR, "specs", "card.json"),
      JSON.stringify(SPEC_WITH_MISSING_REFS, null, 2),
    );

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const flat = flattenTokens(loadResult.value);
    const tokenPaths = new Set(flat.keys());

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const referencedTokens = new Set<string>();
    for (const spec of specsResult.value) {
      for (const ref of Object.values(spec.tokenMapping)) {
        referencedTokens.add(ref.replace(/^\{|\}$/g, ""));
      }
    }

    const missing: string[] = [];
    for (const ref of referencedTokens) {
      if (!tokenPaths.has(ref)) missing.push(ref);
    }

    expect(missing).toContain("color.doesNotExist");
    expect(missing).toContain("border.width");
    expect(missing.length).toBe(2);
  });

  it("should detect deprecated tokens used in specs", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(VALID_TOKENS, null, 2));
    await writeFile(
      join(TEST_DIR, "specs", "alert.json"),
      JSON.stringify(SPEC_WITH_DEPRECATED_REF, null, 2),
    );

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const flat = flattenTokens(loadResult.value);

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const deprecatedUsed: string[] = [];
    for (const spec of specsResult.value) {
      for (const ref of Object.values(spec.tokenMapping)) {
        const path = ref.replace(/^\{|\}$/g, "");
        const token = flat.get(path);
        if (token?.$deprecated) deprecatedUsed.push(path);
      }
    }

    expect(deprecatedUsed).toContain("color.deprecated");
  });

  it("should detect orphan tokens", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(VALID_TOKENS, null, 2));
    await writeFile(
      join(TEST_DIR, "specs", "button.json"),
      JSON.stringify(SPEC_WITH_TOKEN_REFS, null, 2),
    );

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const flat = flattenTokens(loadResult.value);
    const tokenPaths = new Set(flat.keys());

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const referencedTokens = new Set<string>();
    for (const spec of specsResult.value) {
      for (const ref of Object.values(spec.tokenMapping)) {
        referencedTokens.add(ref.replace(/^\{|\}$/g, ""));
      }
    }

    const orphans: string[] = [];
    for (const path of tokenPaths) {
      if (!referencedTokens.has(path)) orphans.push(path);
    }

    // color.deprecated is defined but not referenced in button spec
    expect(orphans).toContain("color.deprecated");
  });

  it("should count tokens by type", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(VALID_TOKENS, null, 2));

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const flat = flattenTokens(loadResult.value);
    const typeCounts = new Map<string, number>();

    for (const [, token] of flat) {
      const type = token.$type ?? "unknown";
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }

    expect(typeCounts.get("color")).toBe(2);
    expect(typeCounts.get("dimension")).toBe(1);
    expect(flat.size).toBe(3);
  });
});
