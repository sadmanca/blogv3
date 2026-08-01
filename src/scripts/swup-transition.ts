import SwupHeadPlugin from '@swup/head-plugin'
import SwupPreloadPlugin from '@swup/preload-plugin'
import SwupProgressPlugin from '@swup/progress-plugin'
import Swup from 'swup'

import { cleanupAll, initAll } from './controllers'

const swup = new Swup({
  containers: ['#swup', '#swup-toc-slot'],
  animateHistoryBrowsing: false,
  cache: true,
  linkToSelf: 'scroll',
  plugins: [
    new SwupPreloadPlugin(),
    // Without this, <head> is never swapped: page-specific styles (Astro hoists
    // scoped component CSS into <head>) plus meta/OG/canonical stay stuck on
    // whichever page was hard-loaded first.
    new SwupHeadPlugin({
      awaitAssets: true,
      persistAssets: true,
    }),
    new SwupProgressPlugin({
      className: 'swup-progress-bar',
      delay: 0,
      transition: 150,
      finishAnimation: false,
    }),
  ],
})

swup.hooks.on('content:replace', cleanupAll, { before: true })

swup.hooks.on('page:view', () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  initAll()
})

// Controllers live outside the swup containers, so nothing initialises them on
// a hard load except this.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll, { once: true })
} else {
  initAll()
}
