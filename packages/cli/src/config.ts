import { loadConfig } from "c12";
import { z } from "zod";
import consola from "consola";

const GrimorioConfigSchema = z
  .object({
    root: z.string().optional(),
    specs: z.string().optional(),
    tokens: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
    components: z.string().optional(),
    validation: z
      .object({
        level: z.enum(["basic", "standard", "strict"]).optional(),
      })
      .optional(),
    figma: z
      .object({
        token: z.string().optional(),
      })
      .optional(),
  })
  .strip();

export type GrimorioConfig = z.infer<typeof GrimorioConfigSchema>;

export function defineConfig(config: GrimorioConfig): GrimorioConfig {
  return config;
}

const DEFAULTS: GrimorioConfig = {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: { level: "standard" },
};

export async function resolveConfig(
  overrides: Partial<GrimorioConfig> = {},
): Promise<GrimorioConfig> {
  const { config: raw } = await loadConfig<GrimorioConfig>({
    name: "grimorio",
    defaults: DEFAULTS,
    overrides,
  });

  if (!raw) return DEFAULTS;

  const result = GrimorioConfigSchema.safeParse(raw);

  if (!result.success) {
    for (const issue of result.error.issues) {
      consola.warn(`Config: invalid value at "${issue.path.join(".")}": ${issue.message}`);
    }
    return DEFAULTS;
  }

  return result.data;
}
