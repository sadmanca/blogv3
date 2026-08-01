import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { RateLimiter } from 'limiter'
import { goodreadsLoader } from 'astro-loader-goodreads';
import { z } from 'astro/zod'
import { getCachedData, isDevCommand } from './lib/cache/api-cache';

const goodreads_read_books = defineCollection({
  loader: goodreadsLoader({
    url: "https://www.goodreads.com/review/list_rss/152185079-sadman-hossain?shelf=read", 
    refreshIntervalDays: 1,
  })
});

const goodreads_user_updates = defineCollection({
  loader: goodreadsLoader({
    url: "https://www.goodreads.com/user/show/152185079-sadman-hossain",
    refreshIntervalDays: 1,
  })
});


const TRAKT_WATCHED_URL = `https://api.trakt.tv/users/sadmanca/watched`
const TRAKT_RATINGS_URL = `https://api.trakt.tv/users/sadmanca/ratings`
const TRAKT_CLIENT_ID = import.meta.env.TRAKT_CLIENT_ID || process.env.TRAKT_CLIENT_ID;
const TMDB_API_KEY = import.meta.env.TMDB_API_KEY || process.env.TMDB_API_KEY;

const limiter_trakt = new RateLimiter({ tokensPerInterval: 1, interval: 'second' })
const limiter_tmdb = new RateLimiter({ tokensPerInterval: 50, interval: 'second' })

async function fetchWithRetry(url: string, type: string, options = {}) {
  const start = performance.now();
  let response: Response | undefined;
  let retries = 5;
  let attempt = 0;

  while (retries > 0) {
    if (type == 'trakt') {
      await limiter_trakt.removeTokens(1);
    } else {
      await limiter_tmdb.removeTokens(1);
    }

    response = await fetch(url, options);
    if (response.ok) {
      const end = performance.now();
      console.log(`[perf] fetched ${url} in ${(end - start).toFixed(2)}ms`);
      return response;
    }

    const shouldRetry = response.status === 429 || response.status >= 500;
    if (!shouldRetry) {
      break;
    }

    retries -= 1;
    attempt += 1;
    const backoffMs = Math.min(1000 * 2 ** attempt, 10000);
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }

  // Report the actual status. A 403 here means a revoked/unauthorised Trakt
  // client id, which is a very different problem from the 429 this used to
  // claim every failure was.
  throw new Error(
    `${type} request failed: ${response!.status} ${response!.statusText} — ${url}`,
  );
}

const TRAKT_HEADERS = () => ({
  'Content-Type': 'application/json',
  'trakt-api-version': '2',
  'trakt-api-key': TRAKT_CLIENT_ID,
  'User-Agent': 'blogv3/1.0.0',
});

/**
 * Trakt paginates the `watched` endpoints (440 movies arrive 100 at a time by
 * default), so a single request silently truncates the collection. 250 is the
 * documented maximum page size; X-Pagination-Page-Count tells us the rest.
 * The `ratings` endpoints send no pagination headers and come back whole,
 * where this harmlessly reads a page count of 1.
 */
async function fetchTraktAll(url: string) {
  const paged = (page: number) => `${url}?limit=250&page=${page}`;

  const first = await fetchWithRetry(paged(1), 'trakt', { headers: TRAKT_HEADERS() });
  const items = await first.json();

  const pageCount = Number(first.headers.get('x-pagination-page-count') ?? 1);
  if (!Number.isFinite(pageCount) || pageCount <= 1) {
    return items;
  }

  for (let page = 2; page <= pageCount; page += 1) {
    const response = await fetchWithRetry(paged(page), 'trakt', { headers: TRAKT_HEADERS() });
    items.push(...(await response.json()));
  }

  console.log(`[content] ${url} — fetched ${items.length} items across ${pageCount} pages`);
  return items;
}

/**
 * The two Trakt collections differ only in these three strings. `type` keys
 * into each Trakt record (`item.movie` / `item.show`), `altType` is the Trakt
 * URL segment, and `tmdbType` is TMDB's.
 */
function createTraktCollection({
  name,
  type,
  altType,
  tmdbType,
}: {
  name: string
  type: 'movie' | 'show'
  altType: 'movies' | 'shows'
  tmdbType: 'movie' | 'tv'
}) {
  return defineCollection({
    schema: z.object({
      id: z.string(),
      title: z.string(),
      year: z.number(),
      rating: z.number(),
      last_watched_at: z.string(),
      // Null when TMDB has no artwork, or when its lookup failed for this one
      // title. TraktGrid renders its placeholder in that case.
      poster: z.string().nullable(),
      imdb: z.string(),
    }),
    loader: async () => {
      try {
        if (!TRAKT_CLIENT_ID || !TMDB_API_KEY) {
          throw new Error('missing TRAKT_CLIENT_ID or TMDB_API_KEY');
        }

        const watchedData = await getCachedData(`${altType}_watched`, () =>
          fetchTraktAll(`${TRAKT_WATCHED_URL}/${altType}`),
        );

        const ratingsData = await getCachedData(`${altType}_ratings`, () =>
          fetchTraktAll(`${TRAKT_RATINGS_URL}/${altType}`),
        );

        const ratings = ratingsData.reduce(
          (
            acc: { [x: string]: any },
            item: { [x: string]: { ids: { tmdb: string | number } }; rating: any },
          ) => {
            acc[item[type].ids.tmdb] = item.rating
            return acc
          },
          {},
        );

        let posterFailures = 0;

        const entries = await Promise.all(watchedData.map(async (item: any) => {
          const tmdbId = item[type].ids.tmdb;
          const base = {
            id: item[type].ids.imdb,
            title: item[type].title,
            year: item[type].year,
            rating: ratings[tmdbId] || 0,
            last_watched_at: item.last_watched_at,
            imdb: item[type].ids.imdb,
          };

          // One flaky poster lookup out of ~500 must not fail the whole build —
          // only a Trakt-level failure is fatal.
          try {
            return await getCachedData(`tmdb_${tmdbType}_${tmdbId}`, async () => {
              const image_api_request = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
              const tmdbResponse = await fetchWithRetry(image_api_request, "tmdb");
              const tmdbData = await tmdbResponse.json();

              return {
                ...base,
                poster: tmdbData.poster_path
                  ? `https://image.tmdb.org/t/p/w200${tmdbData.poster_path}`
                  : null,
              };
            });
          } catch (error) {
            posterFailures += 1;
            return { ...base, poster: null };
          }
        }));

        if (posterFailures > 0) {
          console.warn(`[content] ${name}: ${posterFailures}/${entries.length} poster lookups failed; those render a placeholder`);
        }

        return entries;
      } catch (error) {
        const message = (error as Error).message;

        // In dev, degrade to an empty collection so the server still boots
        // offline. On a build, fail loudly rather than deploying empty grids.
        if (!isDevCommand) {
          throw new Error(`[content] ${name} failed: ${message}`);
        }

        console.warn(`[content] ${name} failed; returning empty list. ${message}`);
        return [];
      }
    }
  });
}

const trakt_watched_movies = createTraktCollection({
  name: 'trakt_watched_movies',
  type: 'movie',
  altType: 'movies',
  tmdbType: 'movie',
})

const trakt_watched_shows = createTraktCollection({
  name: 'trakt_watched_shows',
  type: 'show',
  altType: 'shows',
  tmdbType: 'tv',
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      slug: z.string().optional(),
      order: z.number().optional(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      // Thumbnail customization fields
      thumbnailIcon: z.string().optional(),
      thumbnailIconSize: z.string().optional(),
      thumbnailIconColor: z.string().optional(),
      thumbnailIconColorDark: z.string().optional(),
      thumbnailBgColor: z.string().optional(),
      thumbnailBgColorDark: z.string().optional(),
      thumbnailTheme: z.enum(['dark-on-light', 'light-on-dark']).optional(),
      // Blog card styling fields
      // cardBgColor accepts OKLCH colors for light mode
      // cardBgColorDark accepts OKLCH colors for dark mode (optional, falls back to cardBgColor)
      // Examples: 'oklch(0.95 0.02 240)', 'oklch(0.85 0.1 120)'
      cardBgColor: z.string().optional(),
      cardBgColorDark: z.string().optional(),
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.url().or(z.string().startsWith('/')),
    bio: z.string().optional(),
    mail: z.email().optional(),
    website: z.url().optional(),
    twitter: z.url().optional(),
    github: z.url().optional(),
    linkedin: z.url().optional(),
    discord: z.url().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      image: image(),
      link: z.url(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }),
})

export const collections = { 
  blog, 
  authors, 
  projects, 
  goodreads_read_books, 
  goodreads_user_updates,
  trakt_watched_movies,
  trakt_watched_shows,
}
