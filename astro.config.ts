import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import icon from '@twodft/astro-icon'

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeExpressiveCode from 'rehype-expressive-code'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import tailwindcss from '@tailwindcss/vite'

const isDevCommand = process.argv.slice(2).includes('dev')

const expressiveCodePlugin = [
  rehypeExpressiveCode,
  {
    themes: ['catppuccin-macchiato'],
    defaultProps: {
      wrap: true,
      preserveIndent: true,
      showLineNumbers: true,
      overridesByLang: {
        'bash,sh,zsh': { wrap: false },
      },
      collapseStyle: 'collapsible-auto',
    },
    styleOverrides: {
      codeFontSize: '0.9rem',
      codeFontFamily:
        "Iosevka, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      uiFontFamily:
        "Bricolage Grotesque, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      borderWidth: '2.5px',
    },
    plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
  },
] satisfies [typeof rehypeExpressiveCode, NonNullable<Parameters<typeof rehypeExpressiveCode>[0]>]

export default defineConfig({
  trailingSlash: 'ignore',
  site: 'https://sadman.ca',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  
  image: {
    // Enable modern image formats with fallbacks
    domains: ['sadman.ca'],
    remotePatterns: [{ protocol: 'https' }],
  },
  integrations: [
    mdx(),
    react(),
    sitemap(),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()] as any,
    ...(isDevCommand
      ? {
          optimizeDeps: {
            include: ['react', 'react-dom', 'lucide-react', 'clsx', 'tailwind-merge'],
            exclude: ['@astrojs/mdx'],
          },
        }
      : {}),
    ssr: {
      // Remove JSDOM from externals since we no longer use it
    },
    build: {
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable minification
      minify: 'esbuild',
      // Enable source maps for debugging
      sourcemap: false, // Disable in production for smaller builds
      // Asset optimization
      assetsInlineLimit: 4096, // Inline small assets as base64
    },
  },
  server: {
    port: 1234,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noreferrer', 'noopener'],
          content: { type: "text", value: " ↗" }, // ⤴
          contentProperties: { "aria-hidden": true, class: "no-select" },
        },
      ],
      rehypeHeadingIds,
      rehypeKatex,
      ...(isDevCommand ? [] : [expressiveCodePlugin]),
    ],
    remarkPlugins: [remarkMath, remarkEmoji],
  },
  redirects: {

    '/posts/on-keeping-a-journal': '/blog/on-keeping-a-journal',
    '/posts/coming-up-with-good-ideas': '/blog/coming-up-with-good-ideas',
    '/posts/how-i-deal-with-email': '/blog/how-i-deal-with-email',
    '/posts/why-i-use-trello': '/blog/why-i-use-trello',
    '/posts/a-guide-to-learning': '/blog/a-guide-to-learning/',
    '/posts/my-old-vs-code-setup': '/blog/my-old-vs-code-setup/',
    '/posts/advice-for-high-school-freshmen': '/blog/advice-for-high-school-freshmen/',
    '/posts/analyzing-pey-postings-part-1': '/blog/analyzing-pey-postings-part-1/',
    '/posts/software-showcase-01-asciinema': '/blog/software-showcase-01-asciinema/',
    '/posts/how-to-put-20k+-words-on-a-cheatsheet': '/blog/how-to-put-20k+-words-on-a-cheatsheet/',
    '/posts/work-study-at-uoft': '/blog/work-study-at-uoft/',
    '/posts/pey-coop-jobs-at-uoft': '/blog/pey-coop-jobs-at-uoft/',
    '/posts/what-i-read-in-2024': '/blog/what-i-read-in-2024',
    '/posts/what-i-watched-in-2024': '/blog/what-i-watched-in-2024',
    '/posts/uoft-ece-upper-year-course-reviews': '/blog/uoft-ece-upper-year-course-reviews/',
    '/posts/how-to-use-goodreads-data-in-astro': '/blog/how-to-use-goodreads-data-in-astro',
    '/posts/ece496-timeline': '/blog/ece496-timeline',
    '/posts/find-joy-in-the-boring-bits-of-life': '/blog/find-joy-in-the-boring-bits-of-life',
    '/posts/going-to-the-gym-for-the-first-time-again': '/blog/going-to-the-gym-for-the-first-time-again',

    '/post/on-keeping-a-journal': '/blog/on-keeping-a-journal',
    '/post/coming-up-with-good-ideas': '/blog/coming-up-with-good-ideas',
    '/post/how-i-deal-with-email': '/blog/how-i-deal-with-email',
    '/post/why-i-use-trello': '/blog/why-i-use-trello',
    '/post/a-guide-to-learning': '/blog/a-guide-to-learning/',
    '/post/my-old-vs-code-setup': '/blog/my-old-vs-code-setup/',
    '/post/advice-for-high-school-freshmen': '/blog/advice-for-high-school-freshmen/',
    '/post/analyzing-pey-postings-part-1': '/blog/analyzing-pey-postings-part-1/',
    '/post/software-showcase-01-asciinema': '/blog/software-showcase-01-asciinema/',
    '/post/how-to-put-20k+-words-on-a-cheatsheet': '/blog/how-to-put-20k+-words-on-a-cheatsheet/',
    '/post/work-study-at-uoft': '/blog/work-study-at-uoft/',
    '/post/pey-coop-jobs-at-uoft': '/blog/pey-coop-jobs-at-uoft/',
    '/post/what-i-read-in-2024': '/blog/what-i-read-in-2024',
    '/post/what-i-watched-in-2024': '/blog/what-i-watched-in-2024',
    '/post/uoft-ece-upper-year-course-reviews': '/blog/uoft-ece-upper-year-course-reviews/',
    '/post/how-to-use-goodreads-data-in-astro': '/blog/how-to-use-goodreads-data-in-astro',
    '/post/ece496-timeline': '/blog/ece496-timeline',
    '/post/find-joy-in-the-boring-bits-of-life': '/blog/find-joy-in-the-boring-bits-of-life',
    '/post/going-to-the-gym-for-the-first-time-again': '/blog/going-to-the-gym-for-the-first-time-again',    

    '/categories': '/tags',
    '/archives': '/blog',

    '/magellan-101/': '/blog/uoft-ece-upper-year-course-reviews/',

    // Aliases for the standalone dashboards in public/*.html.
    //
    // Do NOT redirect these to `*.html`. Cloudflare Workers static assets
    // (html_handling: "auto-trailing-slash") already serves `/foo` from
    // `foo.html` and 307s `/foo.html` back to `/foo` — so a `/foo` -> `/foo.html`
    // rule is an infinite redirect loop. Aliases must target the extension-less
    // path, and a page's own slug needs no rule at all.
    '/uoft-work-study-2025': '/uoft-work-study-2025-summer',
    '/uoft-work-study-jobs-2025': '/uoft-work-study-2025-summer',
    '/uoft-work-study-jobs-2024': '/uoft-work-study-2024',
    '/work-study': '/uoft-work-study-2024',
    '/uoft-work-study': '/uoft-work-study-2024',
  },
})
