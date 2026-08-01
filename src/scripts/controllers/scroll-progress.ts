import { rafThrottle } from './heading-regions'

const state = {
  listeners: null as AbortController | null,
  resizeTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
}

function initScrollToTop(signal: AbortSignal) {
  const scrollToTopButton = document.getElementById('scroll-to-top')
  const footer = document.querySelector('footer')
  if (!scrollToTopButton || !footer) return

  scrollToTopButton.addEventListener(
    'click',
    () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    { signal },
  )

  const update = rafThrottle(() => {
    const isFooterVisible = footer.getBoundingClientRect().top <= window.innerHeight
    scrollToTopButton.classList.toggle(
      'hidden',
      window.scrollY <= 300 || isFooterVisible,
    )
  })

  window.addEventListener('scroll', update, { passive: true, signal })
}

function initProgressBar(signal: AbortSignal) {
  const progressBar = document.getElementById('scroll-progress-bar')
  if (!progressBar) return

  // Cache DOM measurements to avoid repeated reflows
  let docHeight = 0
  let lastKnownScrollPosition = 0

  const updateDimensions = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight
  }

  const updateProgress = () => {
    const scrollTop = window.scrollY

    // Skip if scroll position hasn't changed significantly
    if (Math.abs(scrollTop - lastKnownScrollPosition) < 1) return
    lastKnownScrollPosition = scrollTop

    if (docHeight <= 0) {
      updateDimensions()
      if (docHeight <= 0) return
    }

    const clampedPercent = Math.max(
      0,
      Math.min(100, (scrollTop / docHeight) * 100),
    )
    // translate3d rather than width: hardware accelerated, no layout.
    progressBar.style.transform = `translate3d(${clampedPercent - 100}%, 0, 0)`
  }

  const onScroll = rafThrottle(updateProgress)

  const onResize = () => {
    clearTimeout(state.resizeTimeout)
    state.resizeTimeout = setTimeout(() => {
      updateDimensions()
      updateProgress()
    }, 150)
  }

  updateDimensions()
  progressBar.style.transform = 'translate3d(-100%, 0, 0)'
  progressBar.style.transformOrigin = 'left center'

  window.addEventListener('scroll', onScroll, { passive: true, signal })
  window.addEventListener('resize', onResize, { passive: true, signal })

  requestAnimationFrame(updateProgress)
}

export function init() {
  cleanup()

  state.listeners = new AbortController()
  const { signal } = state.listeners

  initScrollToTop(signal)
  initProgressBar(signal)
}

export function cleanup() {
  state.listeners?.abort()
  state.listeners = null
  clearTimeout(state.resizeTimeout)
  state.resizeTimeout = undefined
}
