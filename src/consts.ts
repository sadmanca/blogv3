import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Sadman Hossain',
  description:
    'Sometimes boring explorations into a world of software and beyond.',
  href: process.env.NODE_ENV === 'development' ? 'http://localhost:1234' : 'https://sadman.ca',
  author: 'sadman',
  locale: 'en-US',
  featuredPostCount: 5,
  postsPerPage: 15,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/tags',
    label: 'tags',
  },
  {
    href: '/projects',
    label: 'projects',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://www.linkedin.com/in/sadmanca',
    label: 'LinkedIn',
  },
  {
    href: 'https://github.com/sadmanca',
    label: 'GitHub',
  },
  {
    href: 'mailto:sadman.hossain@mail.utoronto.ca',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'tabler:brand-linkedin-filled',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}

export const FEATURED_PROJECTS = [
  'blog/blog',
  'eagerdb/eagerdb',
  'pey-2023-dashboard/pey-2023-dashboard',
  'work-study-2025-summer/work-study-2025-summer',
  'work-study-2024/work-study-2024',
  'astro-loader-goodreads/astro-loader-goodreads',
  'fricdl/fricdl',
  'libstreetmap/libstreetmap',
]

export const TAG_CLASSES: Record<string, string> = {
  uoft:
    'bg-blue-300 text-primary dark:bg-blue-800 dark:text-white flex items-center gap-x-1 text-xs',
  personal: 'bg-purple-200 text-secondary-foreground dark:bg-purple-900 dark:text-white flex items-center gap-x-1 text-xs',
  advice: 'bg-lime-200 text-secondary-foreground dark:bg-lime-900 dark:text-white flex items-center gap-x-1 text-xs',
  project:
    'bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-x-1 text-xs',
  'blog-challenge':
    'bg-slate-300 text-secondary-foreground dark:bg-slate-700/80 flex items-center gap-x-1 text-xs',
  'blaugust-2025':
    'bg-slate-300/60 text-secondary-foreground dark:bg-slate-800 flex items-center gap-x-1 text-xs',
  'blaugust':
    'bg-slate-300/60 text-secondary-foreground dark:bg-slate-800 flex items-center gap-x-1 text-xs',
  tutorial:
    'bg-amber-200 text-secondary-foreground dark:bg-amber-900 dark:text-white flex items-center gap-x-1 text-xs',
  analysis:
    'bg-indigo-500 text-white hover:bg-indigo-600 flex items-center gap-x-1 text-xs',
}