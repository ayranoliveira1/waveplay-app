import { api } from './api'
import type { StreamConflictError } from '../types'

interface StartStreamBody {
  profileId: string
  tmdbId: number
  type: 'movie' | 'series'
  title: string
}

interface StartStreamSuccess {
  streamId: string
}

export type StartStreamResult =
  | { ok: true; streamId: string }
  | { ok: false; conflict: StreamConflictError }

export async function startStream(
  body: StartStreamBody,
): Promise<StartStreamResult> {
  const response = await api.post<StartStreamSuccess>('/streams/start', body)

  if (response.success) {
    return { ok: true, streamId: response.data.streamId }
  }

  const error = response.error as unknown as StreamConflictError | null
  if (error && error.code === 'MAX_STREAMS_REACHED') {
    return { ok: false, conflict: error }
  }

  throw new Error(
    (response.error as unknown as { message?: string })?.message ??
      'Erro ao iniciar stream',
  )
}

export async function pingStream(streamId: string): Promise<boolean> {
  try {
    const response = await api.put<null>(`/streams/${streamId}/ping`)

    return response.success
  } catch {
    return false
  }
}

export async function stopStream(streamId: string): Promise<void> {
  try {
    await api.delete<null>(`/streams/${streamId}`)
  } catch {
    // silently fail — stream may already be expired
  }
}

export async function killStream(streamId: string): Promise<void> {
  await api.delete<null>(`/streams/${streamId}`)
}
