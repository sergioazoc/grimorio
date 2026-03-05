import type { ComponentSpec } from "../schemas/component-spec.js";
import type { ComponentPreset } from "./types.js";
import { buttonPreset } from "./components/button.js";
import { inputPreset } from "./components/input.js";
import { selectPreset } from "./components/select.js";
import { checkboxPreset } from "./components/checkbox.js";
import { dialogPreset } from "./components/dialog.js";
import { cardPreset } from "./components/card.js";
import { avatarPreset } from "./components/avatar.js";
import { badgePreset } from "./components/badge.js";
import { tabsPreset } from "./components/tabs.js";
import { textareaPreset } from "./components/textarea.js";

const BUILTIN_PRESETS: Record<string, ComponentPreset> = {
  button: buttonPreset,
  input: inputPreset,
  select: selectPreset,
  checkbox: checkboxPreset,
  dialog: dialogPreset,
  card: cardPreset,
  avatar: avatarPreset,
  badge: badgePreset,
  tabs: tabsPreset,
  textarea: textareaPreset,
};

export function getBuiltinPresets(): Record<string, ComponentPreset> {
  return { ...BUILTIN_PRESETS };
}

export function listPresetIds(): string[] {
  return Object.keys(BUILTIN_PRESETS);
}

/**
 * Applies a preset to generate a complete ComponentSpec.
 *
 * - If presetId matches a builtin preset, returns a full spec with the name injected.
 * - If presetId does not match, returns an improved skeleton (always includes accessibility).
 * - Optional overrides are shallow-merged on top of the preset.
 */
export function applyPreset(
  presetId: string,
  name: string,
  overrides?: Partial<ComponentPreset>,
): ComponentSpec {
  const preset = BUILTIN_PRESETS[presetId.toLowerCase()];

  if (preset) {
    return {
      name,
      ...preset,
      ...overrides,
    };
  }

  // Improved skeleton for unknown components
  return {
    name,
    description: overrides?.description ?? `${name} component`,
    category: overrides?.category,
    complexity: overrides?.complexity ?? "moderate",
    props: overrides?.props ?? [],
    variants: overrides?.variants ?? [],
    defaultVariants: overrides?.defaultVariants ?? {},
    slots: overrides?.slots ?? [],
    anatomy: overrides?.anatomy ?? [],
    tokenMapping: overrides?.tokenMapping ?? {},
    states: overrides?.states ?? [],
    events: overrides?.events ?? [],
    dependencies: overrides?.dependencies ?? [],
    accessibility: overrides?.accessibility ?? {
      ariaAttributes: [],
      keyboardInteractions: [],
    },
    guidelines: overrides?.guidelines ?? [],
  };
}
