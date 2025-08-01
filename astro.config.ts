import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import icon from 'astro-icon'

import expressiveCode from 'astro-expressive-code'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'
import rehypeDocument from 'rehype-document'
import swup from '@swup/astro';

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://sadman.ca',
  integrations: [
    expressiveCode(),
    mdx(),
    react(),
    sitemap(),
    icon(),
    swup({
      animationClass: 'transition-',
      containers: ['main'],
      cache: true,
      preload: {
        hover: true,
        visible: false
      },
      accessibility: true,
      forms: false,
      morph: false,
      parallel: false,
      progress: true,
      routes: false,
      smoothScrolling: false,
      updateBodyClass: true,
      updateHead: true,
      reloadScripts: true,
      debug: false,
      loadOnIdle: true,
      globalInstance: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
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
        rehypeDocument,
        {
          css: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
        },
      ],
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
    ],
    remarkPlugins: [remarkMath, remarkEmoji],
  },
  redirects: {
    "/posts/[...slug]": "/blog/[...slug]",
    "/post/[...slug]": "/blog/[...slug]",

    '/categories': '/tags',
    '/archives': '/blog',

    '/magellan-101/': '/posts/uoft-ece-upper-year-course-reviews/',

    '/uoft-pey-coop-jobs-2023': '/uoft-pey-coop-jobs-2023.html',
    '/uoft-work-study-2025': '/uoft-work-study-2025-summer.html',
    '/uoft-work-study-jobs-2025': '/uoft-work-study-2025-summer.html',
    '/uoft-work-study-2024': '/uoft-work-study-2024.html',
    '/uoft-work-study-jobs-2024': '/uoft-work-study-2024.html',
    '/work-study': '/uoft-work-study-2024.html',
    '/uoft-work-study': '/uoft-work-study-2024.html',    
  },
})
