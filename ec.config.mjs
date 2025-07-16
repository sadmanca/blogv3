
import { defineEcConfig } from 'astro-expressive-code'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

export default defineEcConfig({

  themes: ['catppuccin-macchiato'],

  defaultProps: {
    wrap: true,
    preserveIndent: true,
    showLineNumbers: true,
    overridesByLang: {
      'bash,sh,zsh': { wrap: false }
    },
    collapseStyle: 'collapsible-auto',
    useThemedSelectionColors: true,
  },

  styleOverrides: {
    codeFontSize: "0.9rem",
    codeFontFamily: "Iosevka, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    uiFontFamily: "Inter Variable, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    borderWidth: "2.5px",
  },

  shiki: {
    wrap: true,
  },

  plugins: [
    pluginCollapsibleSections(),
    pluginLineNumbers(),
  ]
})