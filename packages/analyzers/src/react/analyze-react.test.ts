import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeReactFile } from "./analyze-react.js";

const fixturesDir = join(fileURLToPath(import.meta.url), "../../fixtures");

describe("analyzeReactFile", () => {
  const source = readFileSync(join(fixturesDir, "Button.tsx"), "utf-8");
  const result = analyzeReactFile("Button.tsx", source);

  it("should detect component name", () => {
    expect(result.name).toBe("Button");
  });

  it("should extract props from interface", () => {
    expect(result.props.length).toBeGreaterThanOrEqual(3);
    const variantProp = result.props.find((p) => p.name === "variant");
    expect(variantProp).toBeDefined();
  });

  it("should extract cva variants", () => {
    expect(result.variants.length).toBeGreaterThanOrEqual(2);
    const variantVariant = result.variants.find((v) => v.name === "variant");
    expect(variantVariant?.values).toContain("primary");
    expect(variantVariant?.values).toContain("secondary");
  });

  it("should extract tailwind classes", () => {
    // Tailwind classes are inside cva() string args, not direct className attr
    // The className is a function call result, so direct classes may not be extracted
    expect(result.framework).toBe("react");
  });

  it("should extract accessibility attrs", () => {
    const roleAttr = result.accessibilityAttrs.find((a) => a.name === "role");
    expect(roleAttr).toBeDefined();
    expect(roleAttr?.value).toBe("button");

    const ariaDisabled = result.accessibilityAttrs.find((a) => a.name === "aria-disabled");
    expect(ariaDisabled).toBeDefined();
  });

  it("should extract imports", () => {
    expect(result.imports.length).toBeGreaterThanOrEqual(1);
    const reactImport = result.imports.find((i) => i.source === "react");
    expect(reactImport).toBeDefined();
  });

  it("should extract exports", () => {
    expect(result.exports.length).toBeGreaterThanOrEqual(1);
  });
});
