import Swup from 'swup'
import SwupPreloadPlugin from '@swup/preload-plugin'
import SwupProgressPlugin from '@swup/progress-plugin'

const swup = new Swup({
  containers: ['#swup', '#swup-toc-slot'],
  animateHistoryBrowsing: false,
  cache: true,
  linkToSelf: 'scroll',
  plugins: [
    new SwupPreloadPlugin(),
    new SwupProgressPlugin({
      className: 'swup-progress-bar',
      delay: 0,
      transition: 150,
      finishAnimation: false,
    }),
  ],
})

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
  ;(window as any).MobileTOCController?.init()
  ;(window as any).TOCController?.init()
  ;(window as any).__SubpostsController?.init()
  ;(window as any).__SidebarController?.init()
  window.dispatchEvent(new CustomEvent('swup:page:view'))
})
