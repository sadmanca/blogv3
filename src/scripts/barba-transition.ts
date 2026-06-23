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
        // Without this, both <main> elements stack vertically as siblings and
        // the enter animation plays hidden below the old one.
        const old = data.current.container as HTMLElement
        old.style.position = 'absolute'
        old.style.top = `${old.offsetTop}px`
        old.style.left = `${old.offsetLeft}px`
        old.style.width = `${old.offsetWidth}px`
        old.style.pointerEvents = 'none'

        window.dispatchEvent(new CustomEvent('barba:before'))
      },
      leave(data: ITransitionData) {
        return new Promise<void>((resolve) => {
          animate(data.current.container, {
            opacity: [1, 0],
            translateY: [0, -15],
            duration: 300,
            ease: 'inOutQuad',
            onComplete: () => resolve(),
          })
        })
      },
      enter(data: ITransitionData) {
        return new Promise<void>((resolve) => {
          animate(data.next.container, {
            opacity: [0, 1],
            translateY: [15, 0],
            duration: 300,
            ease: 'inOutQuad',
            onComplete: () => resolve(),
          })
        })
      },
      after(data: ITransitionData) {
        // Remove previously injected page-specific head elements
        document.head.querySelectorAll('style:not([data-barba-original]), link[rel="stylesheet"]:not([data-barba-original])').forEach((el) => el.remove())

        // Parse new page HTML to extract head styles
        const nextDoc = new DOMParser().parseFromString(data.next.html, 'text/html')

        const currentLinkHrefs = new Set(
          Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.getAttribute('href')),
        )
        nextDoc.head.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
          if (!currentLinkHrefs.has(el.getAttribute('href'))) {
            document.head.appendChild(el.cloneNode(true))
          }
        })

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

        // Dispatch immediately for already-loaded modules (theme, GA, zoom, etc.)
        window.dispatchEvent(new CustomEvent('barba:after'))

        // Poll for late-loading async modules (e.g., toc-header loads via
        // <script type="module"> inside the new container — modules are async
        // and may resolve after barba:after fires the first time).
        const pollForTOC = (attempts = 0) => {
          if (attempts > 20) return
          const ctrl = (window as any).MobileTOCController
          if (ctrl && document.getElementById('mobile-toc-container')) {
            ctrl.init()
          } else if (document.getElementById('mobile-toc-container')) {
            setTimeout(() => pollForTOC(attempts + 1), 50)
          }
        }
        pollForTOC()
      },
    },
  ],
  preventRunning: true,
})
