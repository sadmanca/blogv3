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
        // Position the NEW container absolutely over the OLD container.
        // The old container stays in natural flow — NO reposition, NO shift.
        // This gives a pure crossfade: old fades out on top, new fades in behind.
        const old = data.current.container as HTMLElement
        const next = data.next.container as HTMLElement

        next.style.position = 'absolute'
        next.style.top = `${old.offsetTop}px`
        next.style.left = '0'
        next.style.right = '0'
        next.style.opacity = '0'
        next.style.zIndex = '0'

        old.style.position = 'relative'
        old.style.zIndex = '1'

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
        // Restore new container to natural flow
        const next = data.next.container as HTMLElement
        next.style.position = ''
        next.style.top = ''
        next.style.left = ''
        next.style.right = ''
        next.style.opacity = ''
        next.style.zIndex = ''

        // Reset scroll to top
        window.scrollTo(0, 0)

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

        // Dispatch for already-loaded modules (theme, GA, zoom)
        window.dispatchEvent(new CustomEvent('barba:after'))

        // Force-reinitialize TOC controllers. The modules may be cached
        // and not re-executed, so explicitly reset and init here. This
        // bypasses any stale _initialized flag from prior navigations.
        requestAnimationFrame(() => {
          const win = window as any
          if (win.MobileTOCController) {
            win.MobileTOCController.cleanup()
            win.MobileTOCController._initialized = false
            win.MobileTOCController.init()
          }
          if (win.TOCController) {
            win.TOCController.cleanup()
            win.TOCController._initialized = false
            win.TOCController.init()
          }
        })
      },
    },
  ],
  preventRunning: true,
})
