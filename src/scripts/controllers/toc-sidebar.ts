import {
  buildRegions,
  getVisibleIds,
  observeLayout,
  rafThrottle,
  type Region,
} from './heading-regions'

const HEADER_OFFSET = 80

const state = {
  links: [] as HTMLElement[],
  activeIds: [] as string[],
  headings: [] as HTMLElement[],
  regions: [] as Region[],
  scrollArea: null as HTMLElement | null,
  tocScrollArea: null as HTMLElement | null,
  disposeLayoutObserver: null as (() => void) | null,
}

function reset() {
  const tocContainer = document.getElementById('toc-sidebar-container')
  state.links = Array.from(
    document.querySelectorAll<HTMLElement>(
      '#toc-sidebar-container [data-heading-link]',
    ),
  )
  state.activeIds = []
  state.headings = []
  state.regions = []
  state.scrollArea =
    tocContainer?.querySelector('[data-scroll-container]') || null
  state.tocScrollArea =
    tocContainer?.querySelector('[data-toc-scroll-area]') || null
}

function updateScrollMask() {
  if (!state.scrollArea || !state.tocScrollArea) return

  const { scrollTop, scrollHeight, clientHeight } = state.scrollArea
  const threshold = 5
  const isAtTop = scrollTop <= threshold
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

  state.tocScrollArea.classList.toggle('mask-t-from-90%', !isAtTop)
  state.tocScrollArea.classList.toggle('mask-b-from-90%', !isAtBottom)
}

function scrollToActive(headingIds: string[]) {
  if (!state.scrollArea || !headingIds.length) return

  const activeLink = document.querySelector(
    `#toc-sidebar-container [data-heading-link="${headingIds[0]}"]`,
  )
  if (!activeLink) return

  const { top: areaTop, height: areaHeight } =
    state.scrollArea.getBoundingClientRect()
  const { top: linkTop, height: linkHeight } = activeLink.getBoundingClientRect()

  const currentLinkTop = linkTop - areaTop + state.scrollArea.scrollTop
  const targetScroll = Math.max(
    0,
    Math.min(
      currentLinkTop - (areaHeight - linkHeight) / 2,
      state.scrollArea.scrollHeight - state.scrollArea.clientHeight,
    ),
  )

  if (Math.abs(targetScroll - state.scrollArea.scrollTop) > 5) {
    state.scrollArea.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }
}

function updateLinks(headingIds: string[]) {
  state.links.forEach((link) => {
    link.classList.remove('text-foreground', 'font-bold')
  })

  headingIds.forEach((id) => {
    if (!id) return
    // querySelectorAll, not querySelector: a parent post and a subpost can emit
    // the same heading slug, and both entries should highlight.
    document
      .querySelectorAll(`#toc-sidebar-container [data-heading-link="${id}"]`)
      .forEach((link) => link.classList.add('text-foreground', 'font-bold'))
  })

  scrollToActive(headingIds)
}

function syncActiveIds() {
  const newActiveIds = getVisibleIds(state.headings, state.regions, HEADER_OFFSET)

  if (JSON.stringify(newActiveIds) !== JSON.stringify(state.activeIds)) {
    state.activeIds = newActiveIds
    updateLinks(state.activeIds)
  }
}

// Stable identities so add/removeEventListener pair up correctly.
const handleScroll = rafThrottle(syncActiveIds)

const handleTOCScroll = () => updateScrollMask()

const remeasure = () => {
  const { headings, regions } = buildRegions()
  state.headings = headings
  state.regions = regions
  syncActiveIds()
  updateScrollMask()
}

const handleResize = rafThrottle(remeasure)

export function init() {
  cleanup()
  reset()
  remeasure()

  if (state.headings.length === 0) {
    updateLinks([])
    return
  }

  setTimeout(updateScrollMask, 100)

  // Attach the window listeners before the scrollArea guard: a missing scroll
  // container should only cost the scroll mask, not the whole scroll-spy.
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  state.disposeLayoutObserver = observeLayout(remeasure)

  if (!state.scrollArea) return
  state.scrollArea.addEventListener('scroll', handleTOCScroll, { passive: true })
}

export function cleanup() {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  state.scrollArea?.removeEventListener('scroll', handleTOCScroll)
  state.disposeLayoutObserver?.()

  Object.assign(state, {
    links: [],
    activeIds: [],
    headings: [],
    regions: [],
    scrollArea: null,
    tocScrollArea: null,
    disposeLayoutObserver: null,
  })
}
