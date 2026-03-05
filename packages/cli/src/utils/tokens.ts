import type { GrimorioConfig } from "../config.js";

export function resolveTokensPaths(config: GrimorioConfig): Map<string, string> {
  const { tokens } = config;
  if (!tokens) return new Map([["default", "./tokens.json"]]);
  if (typeof tokens === "string") return new Map([["default", tokens]]);
  return new Map(Object.entries(tokens));
}
