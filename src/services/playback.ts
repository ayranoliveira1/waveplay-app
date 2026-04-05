import { api } from './api'
import type { HistoryItem } from '../types'

// --- Types ---

export interface SaveProgressBody {
  tmdbId: number
  type: 'movie' | 'series'
  progressSeconds: number
  durationSeconds: number
  season?: number
  episode?: number
}

export interface AddHistoryBody {
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  progressSeconds?: number
  durationSeconds?: number
  season?: number
  episode?: number
}

export interface HistoryApiItem {
  id: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  progressSeconds: number
  durationSeconds: number
  season?: number
  episode?: number
  watchedAt: string
}

interface HistoryResponse {
  items: HistoryApiItem[]
  page: number
  totalPages: number
}

// --- Helpers ---

async function playbackGet<T>(path: string): Promise<T> {
  const response = await api.get<T>(path)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro no playback')
  }
  return response.data
}

async function playbackPut<T>(path: string, body: unknown): Promise<T> {
  const response = await api.put<T>(path, body)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro no playback')
  }
  return response.data
}

async function playbackPost<T>(path: string, body: unknown): Promise<T> {
  const response = await api.post<T>(path, body)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro no playback')
  }
  return response.data
}

async function playbackDelete<T>(path: string): Promise<T> {
  const response = await api.delete<T>(path)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro no playback')
  }
  return response.data
}

// --- Progress ---

export function saveProgress(profileId: string, body: SaveProgressBody) {
  return playbackPut<null>(`/progress/${profileId}`, body)
}

// --- History ---

export function getHistory(profileId: string, page = 1, limit = 20) {
  return playbackGet<HistoryResponse>(
    `/history/${profileId}?page=${page}&limit=${limit}`,
  )
}

export function addHistoryItem(profileId: string, body: AddHistoryBody) {
  return playbackPost<null>(`/history/${profileId}`, body)
}

export function clearAllHistory(profileId: string) {
  return playbackDelete<null>(`/history/${profileId}`)
}
