import { readFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { ComponentSpecSchema, type ComponentSpec } from "../schemas/component-spec.js";
import { type Result, ok, err } from "../result.js";

export async function loadSpec(filePath: string): Promise<Result<ComponentSpec, string>> {
  try {
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    const result = ComponentSpecSchema.safeParse(data);
    if (!result.success) {
      return err(`Invalid spec at ${filePath}: ${result.error.message}`);
    }
    return ok(result.data);
  } catch (error) {
    return err(
      `Failed to load spec at ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function loadAllSpecs(dir: string): Promise<Result<ComponentSpec[], string>> {
  try {
    const entries = await readdir(dir, { recursive: true });
    const jsonFiles = entries
      .filter((entry) => typeof entry === "string" && extname(entry) === ".json")
      .map((entry) => join(dir, entry));

    const specs: ComponentSpec[] = [];
    for (const file of jsonFiles) {
      const result = await loadSpec(file);
      if (!result.ok) {
        return err(result.error);
      }
      specs.push(result.value);
    }
    return ok(specs);
  } catch (error) {
    return err(
      `Failed to read specs directory ${dir}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function validateSpec(data: unknown): Result<ComponentSpec, string> {
  const result = ComponentSpecSchema.safeParse(data);
  if (!result.success) {
    return err(`Invalid spec: ${result.error.message}`);
  }
  return ok(result.data);
}
