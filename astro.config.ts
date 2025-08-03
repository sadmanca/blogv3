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
