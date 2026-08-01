export type Region = { id: string; start: number; end: number }

const HEADING_SELECTOR = '.prose h2, .prose h3, .prose h4, .prose h5, .prose h6'

/**
 * Measure every prose heading and the vertical region it owns (from its own
 * top to the next heading's top). Uses offsetTop, so it must be re-run whenever
 * layout shifts — see observeLayout.
 */
export function buildRegions(): {
  headings: HTMLElement[]
  regions: Region[]
} {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
  )

  if (headings.length === 0) return { headings, regions: [] }

  const regions = headings.map((heading, index) => {
    const nextHeading = headings[index + 1]
    return {
      id: heading.id,
      start: heading.offsetTop,
      end: nextHeading ? nextHeading.offsetTop : document.body.scrollHeight,
    }
  })

  return { headings, regions }
}

/** Ids of every heading whose own box or owned region intersects the viewport. */
export function getVisibleIds(
  headings: HTMLElement[],
  regions: Region[],
  headerOffset: number,
): string[] {
  if (headings.length === 0) return []

  const viewportTop = window.scrollY + headerOffset
  const viewportBottom = window.scrollY + window.innerHeight
  const visibleIds = new Set<string>()

  const isInViewport = (top: number, bottom: number) =>
    (top >= viewportTop && top <= viewportBottom) ||
    (bottom >= viewportTop && bottom <= viewportBottom) ||
    (top <= viewportTop && bottom >= viewportBottom)

  headings.forEach((heading) => {
    const headingBottom = heading.offsetTop + heading.offsetHeight
    if (isInViewport(heading.offsetTop, headingBottom)) {
      visibleIds.add(heading.id)
    }
  })

  regions.forEach((region) => {
    if (region.start <= viewportBottom && region.end >= viewportTop) {
      const heading = document.getElementById(region.id)
      if (heading) {
        const headingBottom = heading.offsetTop + heading.offsetHeight
        if (
          region.end > headingBottom &&
          (headingBottom < viewportBottom || viewportTop < region.end)
        ) {
          visibleIds.add(region.id)
        }
      }
    }
  })

  return Array.from(visibleIds)
}

/**
 * Heading offsets are measured on page:view, before images, expressive-code and
 * KaTeX have settled — so the initial measurements are wrong on media-heavy
 * posts. Re-measure once the page finishes loading and whenever .prose resizes.
 * Returns a disposer.
 */
export function observeLayout(onLayoutChange: () => void): () => void {
  let debounce: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    clearTimeout(debounce)
    debounce = setTimeout(onLayoutChange, 150)
  }

  window.addEventListener('load', schedule)

  const prose = document.querySelector('.prose')
  const observer = prose ? new ResizeObserver(schedule) : null
  observer?.observe(prose!)

  return () => {
    clearTimeout(debounce)
    window.removeEventListener('load', schedule)
    observer?.disconnect()
  }
}

/** requestAnimationFrame-throttled wrapper, so scroll handlers run once a frame. */
export function rafThrottle(fn: () => void): () => void {
  let ticking = false
  return () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      fn()
    })
  }
}
