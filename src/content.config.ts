import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { RateLimiter } from 'limiter'
import { goodreadsLoader } from 'astro-loader-goodreads';

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
const TRAKT_CLIENT_ID = import.meta.env.TRAKT_CLIENT_ID
const TMDB_API_KEY = import.meta.env.TMDB_API_KEY

const HEVY_API_URL = 'https://api.hevyapp.com/v1/workouts'
const HEVY_API_KEY = import.meta.env.HEVY_API_KEY

const limiter_trakt = new RateLimiter({ tokensPerInterval: 1, interval: 'second' })
const limiter_tmdb = new RateLimiter({ tokensPerInterval: 50, interval: 'second' })
const limiter_hevy = new RateLimiter({ tokensPerInterval: 10, interval: 'minute' })

async function fetchWithRetry(url: string, type: string, options = {}) {
  let response;
  let retries = 15;

  while (retries > 0) {
    if (type == 'trakt') {
      await limiter_trakt.removeTokens(1);
    } else if (type == 'hevy') {
      await limiter_hevy.removeTokens(1);
    } else {
      await limiter_tmdb.removeTokens(1);
    }
    response = await fetch(url, options);
    if (response.status === 200) {
      return response;
    }

    retries -= 1;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Too many requests or invalid response format');
}

const trakt_watched_movies = defineCollection({
  schema: z.object({
    id: z.string(),
    title: z.string(),
    year: z.number(),
    rating: z.number(),
    last_watched_at: z.string(),
    poster: z.string(),
    imdb: z.string(),
  }),
  loader: async () => {
    const type = 'movie'
    const alt_type = 'movies'
    const alt_type2 = 'movie'
    
    const watchedResponse = await fetchWithRetry(`${TRAKT_WATCHED_URL}/${alt_type}`, "trakt", {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
      },
    });
    const watchedData = await watchedResponse.json();

    const ratingsResponse = await fetchWithRetry(`${TRAKT_RATINGS_URL}/${alt_type}`, "trakt", {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
      },
    });
    const ratingsData = await ratingsResponse.json();

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

    const movies = await Promise.all(watchedData.map(async (item: any) => {
      const tmdbId = item[type].ids.tmdb;
      const image_api_request = `https://api.themoviedb.org/3/${alt_type2}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;

      const tmdbResponse = await fetchWithRetry(image_api_request, "tmdb");
      const tmdbData = await tmdbResponse.json();

      return {
        id: item[type].ids.imdb,
        title: item[type].title,
        year: item[type].year,
        rating: ratings[tmdbId] || 0,
        last_watched_at: item.last_watched_at,
        poster: `https://image.tmdb.org/t/p/w200${tmdbData.poster_path}`,
        imdb: item[type].ids.imdb
      };
    }));

    return movies;
  }
});

const trakt_watched_shows = defineCollection({
  schema: z.object({
    id: z.string(),
    title: z.string(),
    year: z.number(),
    rating: z.number(),
    last_watched_at: z.string(),
    poster: z.string(),
    imdb: z.string(),
  }),
  loader: async () => {
    
    const type = 'show'
    const alt_type = 'shows'
    const alt_type2 = 'tv'
    
    const watchedResponse = await fetchWithRetry(`${TRAKT_WATCHED_URL}/${alt_type}`, "trakt", {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
      },
    });
    const watchedData = await watchedResponse.json();

    const ratingsResponse = await fetchWithRetry(`${TRAKT_RATINGS_URL}/${alt_type}`, "trakt", {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': TRAKT_CLIENT_ID,
      },
    });
    const ratingsData = await ratingsResponse.json();

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

    const shows = await Promise.all(watchedData.map(async (item: any) => {
      const tmdbId = item[type].ids.tmdb;
      const image_api_request = `https://api.themoviedb.org/3/${alt_type2}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;

      const tmdbResponse = await fetchWithRetry(image_api_request, "tmdb");
      const tmdbData = await tmdbResponse.json();

      return {
        id: item[type].ids.imdb,
        title: item[type].title,
        year: item[type].year,
        rating: ratings[tmdbId] || 0,
        last_watched_at: item.last_watched_at,
        poster: `https://image.tmdb.org/t/p/w200${tmdbData.poster_path}`,
        imdb: item[type].ids.imdb
      };
    }));

    return shows;
  }
});

const hevy_workouts = defineCollection({
  schema: z.object({
    id: z.string(),
    title: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    start_time: z.string(),
    end_time: z.string().optional(),
    duration: z.number(),
    exercises: z.array(z.object({
      id: z.string(),
      title: z.string(),
      sets: z.array(z.object({
        type: z.string(),
        weight_kg: z.number().optional(),
        reps: z.number().optional(),
        distance_meters: z.number().optional(),
        duration_seconds: z.number().optional(),
        rpe: z.number().optional(),
      }))
    })),
    volume_kg: z.number(),
    personal_records: z.array(z.any()).optional(),
  }),
  loader: async () => {
    
    try {
      const response = await fetchWithRetry(HEVY_API_URL, "hevy", {
        headers: {
          'api-key': HEVY_API_KEY,
          'accept': 'application/json',
        },
      });
      const data = await response.json();
      
      // Transform the API response to match our schema
      const workouts = data.workouts.map((workout: any) => ({
        id: workout.id,
        title: workout.title || `Workout ${new Date(workout.created_at).toLocaleDateString()}`,
        created_at: workout.created_at,
        updated_at: workout.updated_at,
        start_time: workout.start_time,
        end_time: workout.end_time,
        duration: Math.round((new Date(workout.end_time || workout.updated_at).getTime() - new Date(workout.start_time).getTime()) / 1000 / 60), // duration in minutes
        exercises: (workout.exercises || []).map((exercise: any) => ({
          id: exercise.exercise_template_id || exercise.id || 'unknown',
          title: exercise.exercise_template?.title || exercise.title || 'Unknown Exercise',
          sets: (exercise.sets || []).map((set: any) => ({
            type: set.set_type || 'normal',
            weight_kg: set.weight_kg || undefined,
            reps: set.reps || undefined,
            distance_meters: set.distance_meters || undefined,
            duration_seconds: set.duration_seconds || undefined,
            rpe: set.rpe || undefined,
          }))
        })),
        volume_kg: (workout.exercises || []).reduce((total: number, exercise: any) => {
          return total + (exercise.sets || []).reduce((exerciseTotal: number, set: any) => {
            return exerciseTotal + ((set.weight_kg || 0) * (set.reps || 1));
          }, 0);
        }, 0),
        personal_records: workout.personal_records || [],
      }));

      return workouts;
    } catch (error) {
      console.error('Failed to fetch Hevy data:', error);
      return [];
    }
  }
});

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
    avatar: z.string().url().or(z.string().startsWith('/')),
    bio: z.string().optional(),
    mail: z.string().email().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    discord: z.string().url().optional(),
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
      link: z.string().url(),
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
  hevy_workouts,
}
