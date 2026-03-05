import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ComponentSpecSchema } from "grimorio-core";

const TEST_DIR = join(import.meta.dirname, "__test_spec_infer__");

const SAMPLE_REACT_COMPONENT = `
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onFocus?: () => void;
}

export function Button({ variant = 'primary', size = 'md', disabled, children, onClick, onFocus }: ButtonProps) {
  return (
    <button
      className="btn"
      disabled={disabled}
      onClick={onClick}
      onFocus={onFocus}
      role="button"
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
`;

const SAMPLE_VUE_COMPONENT = `
<script setup lang="ts">
defineProps<{
  label: string;
  type?: 'text' | 'password';
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <input :type="type" :disabled="disabled" :aria-label="label" />
</template>
`;

describe("spec:infer command", () => {
  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(join(TEST_DIR, "specs"), { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it("should infer spec from React component", async () => {
    const componentPath = join(TEST_DIR, "Button.tsx");
    const outputPath = join(TEST_DIR, "specs", "button.json");
    await writeFile(componentPath, SAMPLE_REACT_COMPONENT);

    const { default: specInferCommand } = await import("./spec-infer.js");
    await specInferCommand.run!({
      args: { file: componentPath, output: outputPath },
    } as any);

    expect(existsSync(outputPath)).toBe(true);
    const spec = JSON.parse(await readFile(outputPath, "utf-8"));
    const result = ComponentSpecSchema.safeParse(spec);
    expect(result.success).toBe(true);
    expect(spec.name).toBe("Button");
  });

  it("should separate event handlers from props", async () => {
    const componentPath = join(TEST_DIR, "Button.tsx");
    const outputPath = join(TEST_DIR, "specs", "button.json");
    await writeFile(componentPath, SAMPLE_REACT_COMPONENT);

    const { default: specInferCommand } = await import("./spec-infer.js");
    await specInferCommand.run!({
      args: { file: componentPath, output: outputPath },
    } as any);

    const spec = JSON.parse(await readFile(outputPath, "utf-8"));
    const propNames = spec.props.map((p: { name: string }) => p.name);
    expect(propNames).not.toContain("onClick");
    expect(propNames).not.toContain("onFocus");
    expect(spec.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "onClick" }),
        expect.objectContaining({ name: "onFocus" }),
      ]),
    );
  });

  it("should extract accessibility attributes", async () => {
    const componentPath = join(TEST_DIR, "Button.tsx");
    const outputPath = join(TEST_DIR, "specs", "button.json");
    await writeFile(componentPath, SAMPLE_REACT_COMPONENT);

    const { default: specInferCommand } = await import("./spec-infer.js");
    await specInferCommand.run!({
      args: { file: componentPath, output: outputPath },
    } as any);

    const spec = JSON.parse(await readFile(outputPath, "utf-8"));
    expect(spec.accessibility).toBeDefined();
    expect(spec.accessibility.role).toBe("button");
    expect(spec.accessibility.ariaAttributes).toContain("aria-disabled");
  });

  it("should infer spec from Vue component", async () => {
    const componentPath = join(TEST_DIR, "Input.vue");
    const outputPath = join(TEST_DIR, "specs", "input.json");
    await writeFile(componentPath, SAMPLE_VUE_COMPONENT);

    const { default: specInferCommand } = await import("./spec-infer.js");
    await specInferCommand.run!({
      args: { file: componentPath, output: outputPath },
    } as any);

    expect(existsSync(outputPath)).toBe(true);
    const spec = JSON.parse(await readFile(outputPath, "utf-8"));
    const result = ComponentSpecSchema.safeParse(spec);
    expect(result.success).toBe(true);
  });

  it("should default output path to specs/<name>.json", async () => {
    const componentPath = join(TEST_DIR, "Card.tsx");
    await writeFile(
      componentPath,
      `export function Card({ title }: { title: string }) { return <div>{title}</div>; }`,
    );

    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);

    try {
      const { default: specInferCommand } = await import("./spec-infer.js");
      await specInferCommand.run!({
        args: { file: componentPath },
      } as any);

      expect(existsSync(join(TEST_DIR, "specs", "card.json"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
