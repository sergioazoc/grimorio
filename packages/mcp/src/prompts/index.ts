import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  registerEnrichSpec(server);
  registerGenerateComponent(server);
  registerReviewSystem(server);
  registerAuditAccessibility(server);
}

function registerEnrichSpec(server: McpServer): void {
  server.prompt(
    "enrich-spec",
    "Enrich a component spec with accessibility, design tokens, and usage guidelines",
    { componentName: z.string().describe("Name of the component to enrich") },
    ({ componentName }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `You are a design system expert. Enrich the component spec for "${componentName}".

## Workflow

1. Call \`get_component\` with name "${componentName}" to get the current spec.
2. Call \`get_tokens\` to see available design tokens.
3. Analyze the spec and enrich it with:

### Accessibility
- Add appropriate \`role\` (e.g., "button", "dialog", "tablist")
- Add necessary \`ariaAttributes\` (e.g., "aria-label", "aria-expanded", "aria-disabled")
- Add \`keyboardInteractions\` (e.g., Enter to activate, Escape to close, Arrow keys to navigate)

### Design Tokens
- Map the component's visual properties to available tokens from the token list
- Add token references to the \`tokens\` array (only use tokens that actually exist)

### Guidelines
- Add usage best practices (when to use, when not to use)
- Add composition guidelines (how it works with other components)
- Add content guidelines (text length, tone)

4. Call \`update_spec\` with the enriched spec JSON to save it.

Important:
- Keep all existing props, variants, and slots unchanged
- Only ADD information, don't remove existing data
- Only reference tokens that exist in the design system
- Follow WAI-ARIA best practices for the component pattern`,
          },
        },
      ],
    }),
  );
}

function registerGenerateComponent(server: McpServer): void {
  server.prompt(
    "generate-component",
    "Generate component code from a spec with proper tokens, accessibility, and variants",
    {
      componentName: z.string().describe("Name of the component to generate"),
      framework: z.string().default("react").describe("Framework: react or vue"),
      styling: z
        .string()
        .default("tailwind")
        .describe("Styling: tailwind, css-modules, styled-components"),
    },
    ({ componentName, framework, styling }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Generate a ${framework} component for "${componentName}" using ${styling}.

## Workflow

1. Call \`get_component\` with name "${componentName}" to get the full spec.
2. Call \`get_component_guidelines\` with name "${componentName}" for the implementation checklist.
3. Call \`get_tokens\` to get available design tokens.
4. Generate the component code following these rules:

### Requirements
- Implement ALL props defined in the spec with proper TypeScript types
- Implement ALL variants using ${styling === "tailwind" ? "class-variance-authority (cva)" : styling}
- Apply default variants from \`defaultVariants\`
- Use design tokens instead of hardcoded values (CSS custom properties: \`var(--token-path)\`)
- Add proper accessibility: role, aria attributes, keyboard handlers as specified in the spec
- Implement slots as children/render props
- Export as both named and default export

### Structure
- Props interface with JSDoc descriptions
- Component with forwardRef (React) or defineComponent (Vue)
- Variants configuration
- Keyboard event handlers for accessibility

5. After generating, call \`validate_usage\` with the generated code to verify compliance.
6. Fix any issues reported by the validator.`,
          },
        },
      ],
    }),
  );
}

function registerReviewSystem(server: McpServer): void {
  server.prompt(
    "review-system",
    "Review the overall health of the design system: token coverage, spec completeness, and consistency",
    {},
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Review the health of this design system.

## Workflow

1. Call \`list_components\` to get all components.
2. Call \`validate_tokens\` to check token health.
3. Call \`get_tokens\` to see the full token set.
4. For each component, call \`get_component\` to inspect the spec.

## What to evaluate

### Token Coverage
- Are all components using design tokens?
- Are there orphan tokens (defined but unused)?
- Are there missing tokens (referenced but not defined)?
- Are deprecated tokens still in use?

### Spec Completeness
- Do all components have accessibility defined (role, aria, keyboard)?
- Do all components have guidelines?
- Are descriptions present and helpful?
- Are variants well-defined with clear values?

### Consistency
- Are naming conventions consistent across specs?
- Are categories properly assigned?
- Are complexity levels accurate?
- Do similar components follow similar patterns?

## Output
Provide a structured report with:
- Overall health score (good/needs-attention/critical)
- Specific issues found, grouped by severity
- Actionable recommendations for improvement`,
          },
        },
      ],
    }),
  );
}

function registerAuditAccessibility(server: McpServer): void {
  server.prompt(
    "audit-accessibility",
    "Audit a component's accessibility against WCAG and WAI-ARIA best practices",
    { componentName: z.string().describe("Name of the component to audit") },
    ({ componentName }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Audit the accessibility of the "${componentName}" component.

## Workflow

1. Call \`get_component\` with name "${componentName}" to get the spec.
2. Call \`get_component_guidelines\` with name "${componentName}" for current implementation guidelines.

## What to audit

### WAI-ARIA Pattern Compliance
- Does the component follow the correct WAI-ARIA design pattern?
- Is the role appropriate for the component type?
- Are all required aria attributes specified?
- Are aria-label, aria-describedby, or aria-labelledby included where needed?

### Keyboard Interaction
- Can the component be fully operated with keyboard only?
- Are all expected keyboard interactions defined?
- Does it follow standard keyboard patterns (Enter, Space, Escape, Arrow keys)?
- Is focus management handled correctly for complex components?

### Screen Reader Support
- Will the component be announced correctly?
- Are state changes communicated (expanded, selected, disabled)?
- Are dynamic content updates announced (live regions)?

### Visual Accessibility
- Are tokens used for colors that meet contrast requirements?
- Is focus visible?
- Does the component work without color as the only indicator?

## Output
- List all accessibility issues found
- Rate severity: critical, major, minor
- Provide specific fixes for each issue
- If fixes require spec changes, call \`update_spec\` with the corrected spec`,
          },
        },
      ],
    }),
  );
}
