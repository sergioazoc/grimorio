import { z } from "zod";

export const DesignTokenSchema = z.object({
  $value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
  ]),
  $type: z.string().optional(),
  $description: z.string().optional(),
  $extensions: z.record(z.string(), z.unknown()).optional(),
  $deprecated: z.union([z.boolean(), z.string()]).optional(),
});

export type DesignToken = z.infer<typeof DesignTokenSchema>;

export type TokenGroup = {
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  [key: string]: DesignToken | TokenGroup | string | Record<string, unknown> | undefined;
};

export const TokenGroupSchema: z.ZodType<TokenGroup> = z.lazy(() =>
  z.record(
    z.string(),
    z.union([DesignTokenSchema, TokenGroupSchema, z.string(), z.record(z.string(), z.unknown())]),
  ),
) as z.ZodType<TokenGroup>;

export const TokenFileSchema = z
  .object({})
  .catchall(z.union([DesignTokenSchema, TokenGroupSchema]));

export type TokenFile = z.infer<typeof TokenFileSchema>;
