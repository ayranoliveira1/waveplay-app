import { api } from './api'
import type { MediaItem } from '../types'

export interface LibraryItem {
  id: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  createdAt: string
}

interface ToggleResponse {
  added: boolean
}

async function libraryGet<T>(path: string): Promise<T> {
  const response = await api.get<T>(path)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro na library')
  }
  return response.data
}

async function libraryPost<T>(path: string, body: unknown): Promise<T> {
  const response = await api.post<T>(path, body)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro na library')
  }
  return response.data
}

// Favorites
export function getFavorites(profileId: string) {
  return libraryGet<{ favorites: LibraryItem[] }>(`/favorites/${profileId}`)
}

export function toggleFavorite(profileId: string, item: MediaItem) {
  return libraryPost<ToggleResponse>(`/favorites/${profileId}`, {
    tmdbId: item.id,
    type: item.type,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    rating: item.rating,
  })
}

// Watchlist
export function getWatchlist(profileId: string) {
  return libraryGet<{ items: LibraryItem[] }>(`/watchlist/${profileId}`)
}

export function toggleWatchlistItem(profileId: string, item: MediaItem) {
  return libraryPost<ToggleResponse>(`/watchlist/${profileId}`, {
    tmdbId: item.id,
    type: item.type,
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    rating: item.rating,
  })
}
