<script setup lang="ts">
import { cva } from "class-variance-authority";

const props = withDefaults(
  defineProps<{
    title: string;
    variant?: "default" | "outlined";
    padding?: "sm" | "md" | "lg";
  }>(),
  {
    variant: "default",
    padding: "md",
  },
);

const cardVariants = cva("rounded-lg", {
  variants: {
    variant: {
      default: "bg-white shadow-md",
      outlined: "border border-gray-200",
    },
    padding: {
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
  },
});
</script>

<template>
  <div :class="cardVariants({ variant, padding })" role="region" aria-label="Card">
    <h2 class="text-lg font-bold">{{ title }}</h2>
    <slot />
  </div>
</template>
