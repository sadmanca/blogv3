import Swup from 'swup'
import SwupScriptsPlugin from '@swup/scripts-plugin'
import SwupPreloadPlugin from '@swup/preload-plugin'

const swup = new Swup({
  containers: ['#swup', '#swup-toc-slot'],
  animateHistoryBrowsing: false,
  cache: true,
  linkToSelf: 'scroll',
  plugins: [new SwupPreloadPlugin(), new SwupScriptsPlugin()],
})

// Clean up TOC/subpost controllers before content is replaced
swup.hooks.on(
  'content:replace',
  () => {
    ;(window as any).TOCController?.cleanup()
    ;(window as any).MobileTOCController?.cleanup()
    ;(window as any).__SubpostsController?.cleanup()
    ;(window as any).__SidebarController?.cleanup()
  },
  { before: true },
)

swup.hooks.on('page:view', () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  window.dispatchEvent(new CustomEvent('swup:page:view'))
  ;(window as any).MobileTOCController?.init()
  ;(window as any).TOCController?.init()
  ;(window as any).__SubpostsController?.init()
  ;(window as any).__SidebarController?.init()
})
