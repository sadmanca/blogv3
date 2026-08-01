import {
  buildRegions,
  getVisibleIds,
  observeLayout,
  rafThrottle,
  type Region,
} from './heading-regions'

const INITIAL_OVERVIEW_TEXT = 'Overview'
const HEADER_OFFSET = 102 + 36
const PROGRESS_CIRCLE_RADIUS = 10
const PROGRESS_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_CIRCLE_RADIUS

const state = {
  progressCircle: null as HTMLElement | null,
  currentSectionText: null as HTMLElement | null,
  detailsElement: null as HTMLDetailsElement | null,
  listElement: null as HTMLElement | null,
  scrollArea: null as HTMLElement | null,
  headings: [] as HTMLElement[],
  regions: [] as Region[],
  activeIds: [] as string[],
  disposeLayoutObserver: null as (() => void) | null,
  // Scopes the per-element listeners added by setupInteraction so they can all
  // be dropped in one call.
  interactions: null as AbortController | null,
}

function reset() {
  const tocContainer = document.getElementById('mobile-toc-container')

  state.progressCircle = document.getElementById('mobile-toc-progress-circle')
  state.currentSectionText = document.getElementById(
    'mobile-toc-current-section',
  )
  state.detailsElement = document.querySelector('#mobile-toc-container details')
  state.listElement = document.getElementById('mobile-table-of-contents')
  state.scrollArea =
    tocContainer?.querySelector('[data-scroll-container]') || null
  state.headings = []
  state.regions = []
  state.activeIds = []

  if (state.progressCircle) {
    state.progressCircle.style.strokeDasharray =
      PROGRESS_CIRCLE_CIRCUMFERENCE.toString()
    state.progressCircle.style.strokeDashoffset =
      PROGRESS_CIRCLE_CIRCUMFERENCE.toString()
  }
}

function updateScrollMask() {
  if (!state.scrollArea) return

  const { scrollTop, scrollHeight, clientHeight } = state.scrollArea
  const threshold = 5
  const isAtTop = scrollTop <= threshold
  const isAtBottom = scrollTop >= scrollHeight - clientHeight - threshold

  state.scrollArea.classList.toggle('mask-t-from-80%', !isAtTop)
  state.scrollArea.classList.toggle('mask-b-from-80%', !isAtBottom)
}

function updateProgressCircle() {
  if (!state.progressCircle) return

  const scrollableDistance =
    document.documentElement.scrollHeight - window.innerHeight
  const scrollProgress =
    scrollableDistance > 0
      ? Math.min(Math.max(window.scrollY / scrollableDistance, 0), 1)
      : 0

  state.progressCircle.style.strokeDashoffset = (
    PROGRESS_CIRCLE_CIRCUMFERENCE *
    (1 - scrollProgress)
  ).toString()
}

function scrollToActive(activeHeadingId: string) {
  if (!state.listElement || !state.scrollArea) return

  const activeItem = state.listElement.querySelector(
    `[data-heading-id="${activeHeadingId}"]`,
  )
  if (!activeItem) return

  const scrollContainer = state.scrollArea
  const { top: containerTop, height: containerHeight } =
    scrollContainer.getBoundingClientRect()
  const { top: itemTop, height: itemHeight } = activeItem.getBoundingClientRect()

  const currentItemTop = itemTop - containerTop + scrollContainer.scrollTop
  const targetScroll = Math.max(
    0,
    Math.min(
      currentItemTop - (containerHeight - itemHeight) / 2,
      scrollContainer.scrollHeight - scrollContainer.clientHeight,
    ),
  )

  if (Math.abs(targetScroll - scrollContainer.scrollTop) > 5) {
    scrollContainer.scrollTop = targetScroll
  }
}

function updateCurrentSectionText(headingIds: string[]) {
  if (!state.currentSectionText) return

  if (headingIds.length > 0) {
    const activeTexts = state.headings
      .filter((heading) => headingIds.includes(heading.id) && heading.textContent)
      .map((heading) => heading.textContent!.trim())

    if (activeTexts.length > 0) {
      // If more than one section, style text after the first '·' as muted
      if (activeTexts.length > 1) {
        const first = activeTexts[0]
        const rest = activeTexts.slice(1).join(' · ')
        state.currentSectionText.innerHTML = `${first} <span class="text-muted-foreground">· ${rest}</span>`
      } else {
        state.currentSectionText.textContent = activeTexts[0]
      }
      return
    }
  }

  state.currentSectionText.textContent = INITIAL_OVERVIEW_TEXT
}

function updateLinks(headingIds: string[]) {
  if (!state.listElement || !state.currentSectionText) return

  state.listElement.querySelectorAll('.mobile-toc-item').forEach((item) => {
    const tocItem = item as HTMLElement
    const headingId = tocItem.dataset.headingId
    tocItem.classList.toggle(
      'text-foreground',
      Boolean(headingId && headingIds.includes(headingId)),
    )
  })

  if (headingIds.length > 0) {
    scrollToActive(headingIds[0])
  }

  updateCurrentSectionText(headingIds)
}

function setupInteraction() {
  if (!state.listElement) return

  state.interactions = new AbortController()
  const { signal } = state.interactions

  state.listElement.querySelectorAll('.mobile-toc-item').forEach((item) => {
    item.addEventListener(
      'click',
      () => {
        if (state.detailsElement) state.detailsElement.open = false
      },
      { signal },
    )
  })

  state.scrollArea?.addEventListener('scroll', () => updateScrollMask(), {
    passive: true,
    signal,
  })

  state.detailsElement?.addEventListener(
    'toggle',
    () => {
      if (state.detailsElement?.open) setTimeout(updateScrollMask, 100)
    },
    { signal },
  )
}

function syncActiveIds() {
  const newActiveIds = getVisibleIds(state.headings, state.regions, HEADER_OFFSET)

  if (JSON.stringify(newActiveIds) !== JSON.stringify(state.activeIds)) {
    state.activeIds = newActiveIds
    updateLinks(state.activeIds)
  }

  updateProgressCircle()
}

// Stable identities so add/removeEventListener pair up correctly.
const handleScroll = rafThrottle(syncActiveIds)

const remeasure = () => {
  const { headings, regions } = buildRegions()
  state.headings = headings
  state.regions = regions
  syncActiveIds()
}

const handleResize = rafThrottle(remeasure)

export function init() {
  cleanup()
  reset()

  if (!state.currentSectionText) return

  const { headings, regions } = buildRegions()
  state.headings = headings
  state.regions = regions

  if (state.headings.length === 0) {
    state.currentSectionText.textContent = INITIAL_OVERVIEW_TEXT
  } else {
    state.activeIds = getVisibleIds(state.headings, state.regions, HEADER_OFFSET)
    updateLinks(state.activeIds)
    updateScrollMask()
    setupInteraction()
  }

  updateProgressCircle()

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  state.disposeLayoutObserver = observeLayout(remeasure)
}

export function cleanup() {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  state.disposeLayoutObserver?.()
  state.interactions?.abort()

  state.activeIds = []
  state.headings = []
  state.regions = []
  state.disposeLayoutObserver = null
  state.interactions = null
}
