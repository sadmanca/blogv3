import * as katex from './katex'
import * as mediaGrid from './media-grid'
import * as scrollProgress from './scroll-progress'
import * as subpostsHeader from './subposts-header'
import * as subpostsSidebar from './subposts-sidebar'
import * as tocHeader from './toc-header'
import * as tocSidebar from './toc-sidebar'

export type Controller = {
  init: () => void
  cleanup: () => void
}

/**
 * Controllers live here — outside the swup containers — rather than in a
 * <script> inside the component they drive. Astro emits component scripts in
 * place, and swup replaces container contents by cloning parsed nodes, whose
 * script elements never execute. A controller defined next to its markup is
 * therefore dead on any page reached by client-side navigation.
 *
 * Each init() re-queries its own DOM and bails when absent, so loading every
 * controller on every page is safe.
 */
const controllers: Controller[] = [
  tocSidebar,
  tocHeader,
  subpostsSidebar,
  subpostsHeader,
  scrollProgress,
  mediaGrid,
  katex,
]

export function initAll() {
  controllers.forEach((controller) => controller.init())
}

export function cleanupAll() {
  controllers.forEach((controller) => controller.cleanup())
}
