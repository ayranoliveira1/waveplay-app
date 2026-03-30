import { EMBED_PLAY_BASE_URL } from '../constants/api'
import type { EmbedStatus } from '../types'

export function getMovieEmbedUrl(tmdbId: number): string {
  return `${EMBED_PLAY_BASE_URL}/embed/${tmdbId}`
}

export function getSeriesEmbedUrl(
  tmdbId: number,
  season: number,
  episode: number,
): string {
  return `${EMBED_PLAY_BASE_URL}/embed/${tmdbId}/${season}/${episode}`
}

export async function checkMovieStatus(tmdbId: number): Promise<boolean> {
  try {
    const response = await fetch(
      `${EMBED_PLAY_BASE_URL}/api/status?tmdb=${tmdbId}&type=movie`,
    )
    const data: EmbedStatus = await response.json()
    return data.result
  } catch {
    return false
  }
}

export async function checkSeriesStatus(
  tmdbId: number,
  season: number,
  episode: number,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${EMBED_PLAY_BASE_URL}/api/status?tmdb=${tmdbId}&sea=${season}&epi=${episode}&type=tv`,
    )
    const data: EmbedStatus = await response.json()
    return data.result
  } catch {
    return false
  }
}
