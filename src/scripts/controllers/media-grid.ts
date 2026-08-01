/**
 * Poster/cover grids (Trakt, Goodreads) render a placeholder behind an
 * absolutely-positioned image that fades in on load. This used to rely on an
 * inline onload attribute, which never fires for images already in the HTTP
 * cache — their load event can precede any handler. Sweeping on every page:view
 * catches those, and covers images that arrive via swup navigation.
 */
const IMAGE_SELECTOR = 'img.zoomable-image'

const state = {
  listeners: null as AbortController | null,
}

function markLoaded(img: HTMLImageElement) {
  img.classList.add('loaded')

  const placeholder = img.previousElementSibling
  if (placeholder?.classList.contains('placeholder')) {
    placeholder.classList.add('is-loaded')
  }
}

export function init() {
  cleanup()

  state.listeners = new AbortController()
  const { signal } = state.listeners

  document
    .querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR)
    .forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        markLoaded(img)
        return
      }
      // On error the placeholder deliberately stays put.
      img.addEventListener('load', () => markLoaded(img), { once: true, signal })
    })
}

export function cleanup() {
  state.listeners?.abort()
  state.listeners = null
}
