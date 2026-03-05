import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/grimorio/",
  title: "grimorio",
  description:
    "The place where design system agreements are defined — and the tooling to enforce them.",

  lastUpdated: true,
  cleanUrls: true,

  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo.svg",
      },
    ],
  ],

  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/guide/getting-started" },
          { text: "Reference", link: "/reference/cli" },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "Introduction",
              items: [
                { text: "What is grimorio?", link: "/guide/what-is-grimorio" },
                { text: "Getting Started", link: "/guide/getting-started" },
              ],
            },
            {
              text: "Core Concepts",
              items: [
                { text: "Component Specs", link: "/guide/component-specs" },
                { text: "Design Tokens", link: "/guide/design-tokens" },
                { text: "Validation", link: "/guide/validation" },
              ],
            },
            {
              text: "Integrations",
              items: [
                { text: "Figma", link: "/guide/figma" },
                { text: "AI-Friendly Workflows", link: "/guide/ai" },
                { text: "MCP Server", link: "/guide/mcp" },
              ],
            },
          ],
          "/reference/": [
            {
              text: "Reference",
              items: [
                { text: "CLI Commands", link: "/reference/cli" },
                { text: "Configuration", link: "/reference/configuration" },
                { text: "Spec Schema", link: "/reference/spec-schema" },
                { text: "Token Format", link: "/reference/token-format" },
              ],
            },
          ],
        },
      },
    },
    es: {
      label: "Español",
      lang: "es",
      themeConfig: {
        nav: [
          { text: "Guía", link: "/es/guide/getting-started" },
          { text: "Referencia", link: "/es/reference/cli" },
        ],
        sidebar: {
          "/es/guide/": [
            {
              text: "Introducción",
              items: [
                {
                  text: "¿Qué es grimorio?",
                  link: "/es/guide/what-is-grimorio",
                },
                {
                  text: "Primeros pasos",
                  link: "/es/guide/getting-started",
                },
              ],
            },
            {
              text: "Conceptos clave",
              items: [
                {
                  text: "Component Specs",
                  link: "/es/guide/component-specs",
                },
                { text: "Design Tokens", link: "/es/guide/design-tokens" },
                { text: "Validación", link: "/es/guide/validation" },
              ],
            },
            {
              text: "Integraciones",
              items: [
                { text: "Figma", link: "/es/guide/figma" },
                { text: "Flujos AI-Friendly", link: "/es/guide/ai" },
                { text: "Servidor MCP", link: "/es/guide/mcp" },
              ],
            },
          ],
          "/es/reference/": [
            {
              text: "Referencia",
              items: [
                { text: "Comandos CLI", link: "/es/reference/cli" },
                {
                  text: "Configuración",
                  link: "/es/reference/configuration",
                },
                {
                  text: "Schema del Spec",
                  link: "/es/reference/spec-schema",
                },
                {
                  text: "Formato de Tokens",
                  link: "/es/reference/token-format",
                },
              ],
            },
          ],
        },
        outline: { label: "En esta página" },
        lastUpdated: { text: "Última actualización" },
        docFooter: { prev: "Anterior", next: "Siguiente" },
      },
    },
  },

  themeConfig: {
    logo: "/logo.svg",
    socialLinks: [{ icon: "github", link: "https://github.com/sergioazoc/grimorio" }],
    search: {
      provider: "local",
    },
  },
});
