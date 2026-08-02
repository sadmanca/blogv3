const KATEX_HREF = '/katex/katex.min.css'

/**
 * KaTeX CSS is only pulled in for posts that actually render math. The link is
 * injected at runtime rather than shipped in every page's head, so it has to be
 * re-checked on each navigation. It's loaded asynchronously (preload, then
 * promoted to a stylesheet) so math posts don't block first paint on the CSS.
 */
export function init() {
  if (!document.querySelector('.katex')) return
  if (document.querySelector(`link[href="${KATEX_HREF}"]`)) return

  const preload = document.createElement('link')
  preload.rel = 'preload'
  preload.as = 'style'
  preload.href = KATEX_HREF
  preload.onload = () => {
    preload.rel = 'stylesheet'
  }
  document.head.appendChild(preload)
}

export function cleanup() {
  // The stylesheet is intentionally left in place: re-adding it on every visit
  // to a math post would cause a flash of unstyled equations.
}
