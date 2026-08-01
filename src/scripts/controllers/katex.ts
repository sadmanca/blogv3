const KATEX_HREF =
  'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css'

/**
 * KaTeX CSS is only pulled in for posts that actually render math. The link is
 * injected at runtime rather than shipped in every page's head, so it has to be
 * re-checked on each navigation.
 */
export function init() {
  if (!document.querySelector('.katex')) return
  if (document.querySelector(`link[href="${KATEX_HREF}"]`)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = KATEX_HREF
  document.head.appendChild(link)
}

export function cleanup() {
  // The stylesheet is intentionally left in place: re-adding it on every visit
  // to a math post would cause a flash of unstyled equations.
}
