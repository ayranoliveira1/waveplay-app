export const TMDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN ?? ''
export const TMDB_BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p'

export const EMBED_PLAY_BASE_URL = process.env.EXPO_PUBLIC_EMBED_PLAY_BASE_URL ?? 'https://embedplayapi.site'

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  still: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w300`,
  },
} as const
