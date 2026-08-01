const state = {
  scrollArea: null as HTMLElement | null,
  sidebarScrollArea: null as HTMLElement | null,
}

function updateScrollMask() {
  if (!state.scrollArea || !state.sidebarScrollArea) return

  const { scrollTop, scrollHeight, clientHeight } = state.scrollArea
  const threshold = 5
  const isAtTop = scrollTop <= threshold
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

  state.sidebarScrollArea.classList.toggle('mask-t-from-90%', !isAtTop)
  state.sidebarScrollArea.classList.toggle('mask-b-from-90%', !isAtBottom)
}

function scrollToActive() {
  if (!state.scrollArea) return

  const activeItem = state.scrollArea.querySelector(
    '.subposts-sidebar-active-item',
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

  const sidebarContainer = document.getElementById('subposts-sidebar-container')
  if (!sidebarContainer) return

  state.scrollArea = sidebarContainer.querySelector('[data-scroll-container]')
  state.sidebarScrollArea = sidebarContainer.querySelector(
    '[data-subposts-sidebar-scroll]',
  )

  state.scrollArea?.addEventListener('scroll', updateScrollMask, {
    passive: true,
  })

  requestAnimationFrame(() => {
    scrollToActive()
    setTimeout(updateScrollMask, 100)
  })
}

export function cleanup() {
  state.scrollArea?.removeEventListener('scroll', updateScrollMask)
  state.scrollArea = null
  state.sidebarScrollArea = null
}
