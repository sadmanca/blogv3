import barba from '@barba/core'
import { animate } from 'animejs'
import type { ITransitionData } from '@barba/core'

// Mark all pre-existing head elements so we don't remove them on transitions
document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
  el.setAttribute('data-barba-original', '')
})

barba.init({
  transitions: [
    {
      name: 'default-transition',
      beforeLeave(data: ITransitionData) {
        // Take old container out of flex flow so new container fills its place.
        // Preserve exact position and size so there is no visual shift — the
        // old content crossfades in-place while the new content appears behind it.
        const old = data.current.container as HTMLElement
        old.style.position = 'absolute'
        old.style.top = `${old.offsetTop}px`
        old.style.left = '0'
        old.style.right = '0'
        old.style.height = `${old.offsetHeight}px`
        old.style.pointerEvents = 'none'
        old.style.overflow = 'hidden'

        window.dispatchEvent(new CustomEvent('barba:before'))
      },
      leave(data: ITransitionData) {
        return new Promise<void>((resolve) => {
          animate(data.current.container, {
            opacity: [1, 0],
            duration: 200,
            ease: 'inOutQuad',
            onComplete: () => resolve(),
          })
        })
      },
      enter(data: ITransitionData) {
        return new Promise<void>((resolve) => {
          animate(data.next.container, {
            opacity: [0, 1],
            duration: 200,
            ease: 'inOutQuad',
            onComplete: () => resolve(),
          })
        })
      },
      after(data: ITransitionData) {
        // Reset scroll to top on every navigation
        window.scrollTo(0, 0)

        // Remove previously injected page-specific head elements
        document.head.querySelectorAll('style:not([data-barba-original]), link[rel="stylesheet"]:not([data-barba-original])').forEach((el) => el.remove())

        // Parse new page HTML to extract head styles and module scripts
        const nextDoc = new DOMParser().parseFromString(data.next.html, 'text/html')

        // Copy stylesheets from new page head
        const currentLinkHrefs = new Set(
          Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.getAttribute('href')),
        )
        nextDoc.head.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
          if (!currentLinkHrefs.has(el.getAttribute('href'))) {
            document.head.appendChild(el.cloneNode(true))
          }
        })

        // Copy inline styles from new page head
        const currentStyleTexts = new Set(
          Array.from(document.head.querySelectorAll('style')).map((s) => s.textContent),
        )
        nextDoc.head.querySelectorAll('style').forEach((el) => {
          if (!currentStyleTexts.has(el.textContent)) {
            document.head.appendChild(el.cloneNode(true))
          }
        })

        // Update page title
        const newTitle = nextDoc.head.querySelector('title')
        if (newTitle) {
          document.title = newTitle.textContent || ''
        }

        // Force-load all <script type="module"> URLs found in the new page.
        // Barba inserts these via innerHTML+appendChild which browsers may
        // not reliably execute for ES modules. dynamic import() guarantees
        // the modules run their init code and register barba listeners.
        const seen = new Set<string>()
        const loadModule = (src: string) => {
          if (seen.has(src)) return
          seen.add(src)
          import(/* @vite-ignore */ src).catch(() => {})
        }
        nextDoc.querySelectorAll('script[type="module"][src]').forEach((el: Element) => {
          const src = el.getAttribute('src')
          if (src) loadModule(src)
        })
        if (data.next.container) {
          data.next.container.querySelectorAll('script[type="module"][src]').forEach((el) => {
            const src = el.getAttribute('src')
            if (src) loadModule(src)
          })
        }

        // Dispatch immediately for already-loaded modules (theme, GA, zoom, etc.)
        window.dispatchEvent(new CustomEvent('barba:after'))

        // Poll for late-loading async TOC modules. Modules loaded via dynamic
        // import() above may still be pending; retry until controllers appear.
        requestAnimationFrame(() => {
          const pollForTOC = (attempts = 0) => {
            if (attempts > 40) return
            const win = window as any
            const target = document.getElementById('mobile-toc-container') || document.getElementById('toc-sidebar-container')
            if (!target) return
            if (target.id === 'mobile-toc-container' && win.MobileTOCController) {
              return win.MobileTOCController.init()
            }
            if (target.id === 'toc-sidebar-container' && win.TOCController) {
              return win.TOCController.init()
            }
            setTimeout(() => pollForTOC(attempts + 1), 50)
          }
          pollForTOC()
        })
      },
    },
  ],
  preventRunning: true,
})
