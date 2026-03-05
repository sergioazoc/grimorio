import type { ComponentSpec } from "./schemas/component-spec.js";

export type DiffCategory =
  | "props"
  | "variants"
  | "tokenMapping"
  | "slots"
  | "anatomy"
  | "states"
  | "events";
export type DiffType = "missing" | "extra" | "changed";

export interface SpecDiffItem {
  category: DiffCategory;
  type: DiffType;
  name: string;
  message: string;
  source?: unknown;
  target?: unknown;
}

export interface SpecDiffResult {
  componentName: string;
  inSync: boolean;
  totalDifferences: number;
  differences: SpecDiffItem[];
  summary: {
    props: { missing: number; extra: number; changed: number };
    variants: { missing: number; extra: number; changed: number };
    tokenMapping: { missing: number; extra: number; changed: number };
    slots: { missing: number; extra: number };
    anatomy: { missing: number; extra: number };
    states: { missing: number; extra: number };
    events: { missing: number; extra: number };
  };
}

/**
 * Compare two ComponentSpecs and produce a structured diff.
 * "source" is the reference (e.g. Figma), "target" is the spec to validate against (e.g. repo).
 */
export function compareSpecs(source: ComponentSpec, target: ComponentSpec): SpecDiffResult {
  const differences: SpecDiffItem[] = [];

  // --- Props ---
  const targetPropsByName = new Map(target.props.map((p) => [p.name, p]));
  const sourcePropsByName = new Map(source.props.map((p) => [p.name, p]));

  for (const sp of source.props) {
    const tp = targetPropsByName.get(sp.name);
    if (!tp) {
      differences.push({
        category: "props",
        type: "missing",
        name: sp.name,
        message: `Prop "${sp.name}" (${sp.type}) exists in source but not in target`,
        source: sp.type,
      });
    } else {
      if (sp.type !== tp.type) {
        differences.push({
          category: "props",
          type: "changed",
          name: sp.name,
          message: `Prop "${sp.name}" type differs: source="${sp.type}", target="${tp.type}"`,
          source: sp.type,
          target: tp.type,
        });
      }
      if (sp.required !== tp.required) {
        differences.push({
          category: "props",
          type: "changed",
          name: sp.name,
          message: `Prop "${sp.name}" required differs: source=${sp.required}, target=${tp.required}`,
          source: sp.required,
          target: tp.required,
        });
      }
    }
  }

  for (const tp of target.props) {
    if (!sourcePropsByName.has(tp.name)) {
      differences.push({
        category: "props",
        type: "extra",
        name: tp.name,
        message: `Prop "${tp.name}" (${tp.type}) exists in target but not in source`,
        target: tp.type,
      });
    }
  }

  // --- Variants ---
  const targetVariantsByName = new Map(target.variants.map((v) => [v.name, v]));
  const sourceVariantsByName = new Map(source.variants.map((v) => [v.name, v]));

  for (const sv of source.variants) {
    const tv = targetVariantsByName.get(sv.name);
    if (!tv) {
      differences.push({
        category: "variants",
        type: "missing",
        name: sv.name,
        message: `Variant "${sv.name}" exists in source but not in target`,
        source: sv.values,
      });
    } else {
      const sourceSet = new Set(sv.values);
      const targetSet = new Set(tv.values);
      const missingValues = sv.values.filter((v) => !targetSet.has(v));
      const extraValues = tv.values.filter((v) => !sourceSet.has(v));
      if (missingValues.length > 0 || extraValues.length > 0) {
        differences.push({
          category: "variants",
          type: "changed",
          name: sv.name,
          message: `Variant "${sv.name}" values differ: ${missingValues.length > 0 ? `missing=[${missingValues.join(", ")}]` : ""}${missingValues.length > 0 && extraValues.length > 0 ? " " : ""}${extraValues.length > 0 ? `extra=[${extraValues.join(", ")}]` : ""}`,
          source: sv.values,
          target: tv.values,
        });
      }
    }
  }

  for (const tv of target.variants) {
    if (!sourceVariantsByName.has(tv.name)) {
      differences.push({
        category: "variants",
        type: "extra",
        name: tv.name,
        message: `Variant "${tv.name}" exists in target but not in source`,
        target: tv.values,
      });
    }
  }

  // --- Token Mapping ---
  const sourceKeys = new Set(Object.keys(source.tokenMapping));
  const targetKeys = new Set(Object.keys(target.tokenMapping));

  for (const key of sourceKeys) {
    if (!targetKeys.has(key)) {
      differences.push({
        category: "tokenMapping",
        type: "missing",
        name: key,
        message: `Token mapping "${key}" → "${source.tokenMapping[key]}" exists in source but not in target`,
        source: source.tokenMapping[key],
      });
    } else if (source.tokenMapping[key] !== target.tokenMapping[key]) {
      differences.push({
        category: "tokenMapping",
        type: "changed",
        name: key,
        message: `Token mapping "${key}" differs: source="${source.tokenMapping[key]}", target="${target.tokenMapping[key]}"`,
        source: source.tokenMapping[key],
        target: target.tokenMapping[key],
      });
    }
  }

  for (const key of targetKeys) {
    if (!sourceKeys.has(key)) {
      differences.push({
        category: "tokenMapping",
        type: "extra",
        name: key,
        message: `Token mapping "${key}" → "${target.tokenMapping[key]}" exists in target but not in source`,
        target: target.tokenMapping[key],
      });
    }
  }

  // --- Slots ---
  const sourceSlots = new Set(source.slots.map((s) => s.name));
  const targetSlots = new Set(target.slots.map((s) => s.name));

  for (const name of sourceSlots) {
    if (!targetSlots.has(name)) {
      differences.push({
        category: "slots",
        type: "missing",
        name,
        message: `Slot "${name}" exists in source but not in target`,
      });
    }
  }

  for (const name of targetSlots) {
    if (!sourceSlots.has(name)) {
      differences.push({
        category: "slots",
        type: "extra",
        name,
        message: `Slot "${name}" exists in target but not in source`,
      });
    }
  }

  // --- Anatomy ---
  const sourceAnatomy = new Set(source.anatomy.map((a) => a.name));
  const targetAnatomy = new Set(target.anatomy.map((a) => a.name));

  for (const name of sourceAnatomy) {
    if (!targetAnatomy.has(name)) {
      differences.push({
        category: "anatomy",
        type: "missing",
        name,
        message: `Anatomy part "${name}" exists in source but not in target`,
      });
    }
  }

  for (const name of targetAnatomy) {
    if (!sourceAnatomy.has(name)) {
      differences.push({
        category: "anatomy",
        type: "extra",
        name,
        message: `Anatomy part "${name}" exists in target but not in source`,
      });
    }
  }

  // --- States ---
  const sourceStates = new Set(source.states);
  const targetStates = new Set(target.states);

  for (const state of sourceStates) {
    if (!targetStates.has(state)) {
      differences.push({
        category: "states",
        type: "missing",
        name: state,
        message: `State "${state}" exists in source but not in target`,
      });
    }
  }

  for (const state of targetStates) {
    if (!sourceStates.has(state)) {
      differences.push({
        category: "states",
        type: "extra",
        name: state,
        message: `State "${state}" exists in target but not in source`,
      });
    }
  }

  // --- Events ---
  const sourceEvents = new Set(source.events.map((e) => e.name));
  const targetEvents = new Set(target.events.map((e) => e.name));

  for (const name of sourceEvents) {
    if (!targetEvents.has(name)) {
      differences.push({
        category: "events",
        type: "missing",
        name,
        message: `Event "${name}" exists in source but not in target`,
      });
    }
  }

  for (const name of targetEvents) {
    if (!sourceEvents.has(name)) {
      differences.push({
        category: "events",
        type: "extra",
        name,
        message: `Event "${name}" exists in target but not in source`,
      });
    }
  }

  // --- Summary ---
  const summary = {
    props: { missing: 0, extra: 0, changed: 0 },
    variants: { missing: 0, extra: 0, changed: 0 },
    tokenMapping: { missing: 0, extra: 0, changed: 0 },
    slots: { missing: 0, extra: 0 },
    anatomy: { missing: 0, extra: 0 },
    states: { missing: 0, extra: 0 },
    events: { missing: 0, extra: 0 },
  };

  for (const diff of differences) {
    const cat = summary[diff.category];
    (cat as Record<string, number>)[diff.type]++;
  }

  return {
    componentName: target.name,
    inSync: differences.length === 0,
    totalDifferences: differences.length,
    differences,
    summary,
  };
}
