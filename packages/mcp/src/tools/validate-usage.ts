import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs, loadTokens } from "grimorio-core";
import { analyzeReactFile, analyzeVueFile } from "grimorio-analyzers";
import { validate, type ValidationIssue } from "grimorio-validators";
import type { McpServerConfig } from "../server.js";

function getSuggestion(issue: ValidationIssue): string {
  switch (issue.code) {
    case "MISSING_PROP":
      return `Add the required prop \`${issue.expected}\` to the component interface and ensure it is used in the render.`;
    case "EXTRA_PROP":
      return `The prop \`${issue.actual}\` is not in the spec. Remove it or update the spec with \`grimorio add\`.`;
    case "MISSING_VARIANT":
      return `Add the variant \`${issue.expected}\` to the component's cva() or variant configuration.`;
    case "EXTRA_VARIANT":
      return `The variant \`${issue.actual}\` is not in the spec. Remove it or update the spec.`;
    case "MISSING_ANATOMY_PART":
      return `Add the anatomy part \`${issue.expected}\` (e.g., \`Component.${issue.expected}\`).`;
    case "HARDCODED_VALUE":
      return `Replace the hardcoded value \`${issue.actual}\` with a design token.`;
    case "NON_TOKENIZED_CLASS":
      return `Replace the non-tokenized class with a design token reference.`;
    case "MISSING_TOKEN":
      return `The token \`${issue.expected}\` is referenced in the spec but doesn't exist. Add it to tokens.json.`;
    case "MISSING_ROLE":
      return `Add \`role="${issue.expected}"\` to the root element.`;
    case "MISSING_ARIA_ATTR":
      return `Add the \`${issue.expected}\` attribute to the appropriate element.`;
    case "MISSING_KEYBOARD_HANDLER":
      return `Add an \`onKeyDown\` handler that handles: ${issue.expected ?? "required keyboard interactions"}.`;
    case "INTERACTIVE_WITHOUT_KEYBOARD":
      return `This interactive element needs keyboard support. Add an \`onKeyDown\` handler.`;
    default:
      return "";
  }
}

export function registerValidateUsage(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "validate_usage",
    "Validate component code against its spec. Returns issues with actionable suggestions for fixing each one.",
    {
      code: z.string().describe("Component source code (JSX/TSX/Vue)"),
      componentName: z.string().describe("Name of the component to validate against"),
      framework: z.enum(["react", "vue"]).default("react").describe("Framework"),
    },
    async ({ code, componentName, framework }) => {
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const specsResult = await loadAllSpecs(specsDir);

      if (!specsResult.ok) {
        return {
          content: [{ type: "text" as const, text: `Error loading specs: ${specsResult.error}` }],
        };
      }

      const spec = specsResult.value.find(
        (s) => s.name.toLowerCase() === componentName.toLowerCase(),
      );

      if (!spec) {
        return {
          content: [{ type: "text" as const, text: `No spec found for "${componentName}"` }],
        };
      }

      const analysis =
        framework === "vue"
          ? analyzeVueFile("input.vue", code)
          : analyzeReactFile("input.tsx", code);

      let tokens;
      if (config.tokens) {
        const tokensResult = await loadTokens(config.tokens);
        if (tokensResult.ok) tokens = tokensResult.value;
      }

      const level = config.validation?.level ?? "standard";
      const result = validate(analysis, spec, tokens, level);

      const issuesWithSuggestions = result.issues.map((issue) => ({
        ...issue,
        suggestion: getSuggestion(issue),
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                valid: result.valid,
                issueCount: result.issues.length,
                issues: issuesWithSuggestions,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
