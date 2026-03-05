import { ResolverFactory } from "oxc-resolver";
import type { Result } from "grimorio-core";
import { ok, err } from "grimorio-core";

export function resolveImport(specifier: string, fromFile: string): Result<string, string> {
  try {
    const resolver = new ResolverFactory({
      conditionNames: ["import", "node", "default"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".vue", ".json"],
    });

    const directory = fromFile.substring(0, fromFile.lastIndexOf("/"));
    const result = resolver.sync(directory, specifier);

    if (result.path) {
      return ok(result.path);
    }

    return err(`Could not resolve "${specifier}" from "${fromFile}"`);
  } catch (error) {
    return err(
      `Failed to resolve "${specifier}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
