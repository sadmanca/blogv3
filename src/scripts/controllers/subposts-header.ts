const state = {
  scrollArea: null as HTMLElement | null,
  detailsElement: null as HTMLDetailsElement | null,
  headerScrollArea: null as HTMLElement | null,
  // Scopes the per-element listeners so they can all be dropped in one call.
  interactions: null as AbortController | null,
}

function updateScrollMask() {
  if (!state.scrollArea || !state.headerScrollArea) return

  const { scrollTop, scrollHeight, clientHeight } = state.scrollArea
  const threshold = 5
  const isAtTop = scrollTop <= threshold
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

  state.headerScrollArea.classList.toggle('mask-t-from-80%', !isAtTop)
  state.headerScrollArea.classList.toggle('mask-b-from-80%', !isAtBottom)
}

function scrollToActive() {
  if (!state.scrollArea) return

  const activeItem = state.scrollArea.querySelector(
    '.mobile-subposts-active-item',
  )
  if (!activeItem) return

  const { top: areaTop, height: areaHeight } =
    state.scrollArea.getBoundingClientRect()
  const { top: itemTop, height: itemHeight } = activeItem.getBoundingClientRect()

  const currentItemTop = itemTop - areaTop + state.scrollArea.scrollTop
  state.scrollArea.scrollTop = Math.max(
    0,
    Math.min(
      currentItemTop - (areaHeight - itemHeight) / 2,
      state.scrollArea.scrollHeight - state.scrollArea.clientHeight,
    ),
  )
}

export function init() {
  cleanup()

  const container = document.getElementById('mobile-subposts-container')
  if (!container) return

  state.scrollArea = container.querySelector('[data-scroll-container]')
  state.detailsElement = container.querySelector('details')
  state.headerScrollArea = container.querySelector(
    '[data-subposts-header-scroll]',
  )

  state.interactions = new AbortController()
  const { signal } = state.interactions

  state.scrollArea?.addEventListener('scroll', updateScrollMask, {
    passive: true,
    signal,
  })

  state.detailsElement?.addEventListener(
    'toggle',
    () => {
      if (!state.detailsElement?.open) return
      requestAnimationFrame(() => {
        scrollToActive()
        setTimeout(updateScrollMask, 100)
      })
    },
    { signal },
  )

  container.querySelectorAll('.mobile-subposts-link').forEach((link) => {
    link.addEventListener(
      'click',
      () => {
        if (state.detailsElement) state.detailsElement.open = false
      },
      { signal },
    )
  })
}

export function cleanup() {
  state.interactions?.abort()
  state.interactions = null
  state.scrollArea = null
  state.detailsElement = null
  state.headerScrollArea = null
}
