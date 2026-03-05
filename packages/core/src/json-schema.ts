import { zodToJsonSchema } from "zod-to-json-schema";
import { ComponentSpecSchema } from "./schemas/component-spec.js";
import { TokenFileSchema } from "./schemas/design-tokens.js";
import type { JsonSchema7Type } from "zod-to-json-schema";

export function generateComponentSpecJsonSchema(): JsonSchema7Type {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod 4 types are incompatible with zod-to-json-schema's expected Zod 3 types
  return zodToJsonSchema(ComponentSpecSchema as any, "ComponentSpec");
}

export function generateTokenFileJsonSchema(): JsonSchema7Type {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod 4 types are incompatible with zod-to-json-schema's expected Zod 3 types
  return zodToJsonSchema(TokenFileSchema as any, "TokenFile");
}
