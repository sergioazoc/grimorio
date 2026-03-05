import { describe, it, expect } from "vitest";
import { parseSync } from "oxc-parser";
import { extractVariants } from "./extract-variants.js";

function parse(code: string) {
  const result = parseSync("test.tsx", code, { sourceType: "module" });
  return result.program;
}

describe("extractVariants", () => {
  it("should extract variants from cva call", () => {
    const program = parse(`
      const buttonVariants = cva('base', {
        variants: {
          variant: {
            primary: 'bg-blue-500',
            secondary: 'bg-gray-200',
          },
          size: {
            sm: 'h-8',
            md: 'h-10',
            lg: 'h-12',
          },
        },
        defaultVariants: {
          variant: 'primary',
          size: 'md',
        },
      })
    `);

    const variants = extractVariants(program);
    expect(variants).toHaveLength(2);
    expect(variants[0].name).toBe("variant");
    expect(variants[0].values).toEqual(["primary", "secondary"]);
    expect(variants[1].name).toBe("size");
    expect(variants[1].values).toEqual(["sm", "md", "lg"]);
  });

  it("should return empty for no cva calls", () => {
    const program = parse(`const x = 42`);
    const variants = extractVariants(program);
    expect(variants).toEqual([]);
  });
});
