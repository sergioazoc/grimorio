import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "grimorio",
    version: "1.0.0",
    description: "Design system infrastructure CLI",
  },
  subCommands: {
    init: () => import("./commands/init.js").then((m) => m.default),
    "spec:infer": () => import("./commands/spec-infer.js").then((m) => m.default),
    validate: () => import("./commands/validate.js").then((m) => m.default),
    add: () => import("./commands/add.js").then((m) => m.default),
    "figma:import": () => import("./commands/figma-import.js").then((m) => m.default),
    "figma:validate": () => import("./commands/figma-validate.js").then((m) => m.default),
    "tokens:list": () => import("./commands/tokens-list.js").then((m) => m.default),
    "tokens:validate": () => import("./commands/tokens-validate.js").then((m) => m.default),
    "tokens:export": () => import("./commands/tokens-export.js").then((m) => m.default),
    "mcp:serve": () => import("./commands/mcp-serve.js").then((m) => m.default),
  },
});

void runMain(main);
