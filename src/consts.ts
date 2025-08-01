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
];