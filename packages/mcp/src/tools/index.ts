import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServerConfig } from "../server.js";
import { registerListComponents } from "./list-components.js";
import { registerGetComponent } from "./get-component.js";
import { registerGetTokens } from "./get-tokens.js";
import { registerGetComponentSource } from "./get-component-source.js";
import { registerValidateUsage } from "./validate-usage.js";
import { registerFindComponent } from "./find-component.js";
import { registerGetComponentGuidelines } from "./get-component-guidelines.js";
import { registerInitProject } from "./init-project.js";
import { registerAddComponent } from "./add-component.js";
import { registerInferSpec } from "./infer-spec.js";
import { registerValidateComponent } from "./validate-component.js";
import { registerValidateTokens } from "./validate-tokens.js";
import { registerExportTokens } from "./export-tokens.js";
import { registerUpdateSpec } from "./update-spec.js";
import { registerImportFromFigma } from "./import-from-figma.js";
import { registerValidateFigma } from "./validate-figma.js";

export function registerTools(server: McpServer, config: McpServerConfig): void {
  // Read tools
  registerListComponents(server, config);
  registerGetComponent(server, config);
  registerGetTokens(server, config);
  registerGetComponentSource(server);
  registerValidateUsage(server, config);
  registerFindComponent(server, config);
  registerGetComponentGuidelines(server, config);

  // Action tools
  registerInitProject(server);
  registerAddComponent(server, config);
  registerInferSpec(server);
  registerValidateComponent(server, config);
  registerValidateTokens(server, config);
  registerExportTokens(server, config);
  registerUpdateSpec(server, config);
  registerImportFromFigma(server, config);
  registerValidateFigma(server, config);
}
