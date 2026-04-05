import { useCallback, useRef, useState } from 'react'
import {
  startStream as startStreamApi,
  pingStream as pingStreamApi,
  stopStream as stopStreamApi,
  killStream as killStreamApi,
} from '../services/stream'
import type { StartStreamResult } from '../services/stream'

export function useStream() {
  const streamIdRef = useRef<string | null>(null)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [sessionKilled, setSessionKilled] = useState(false)

  const clearPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }, [])

  const startPing = useCallback(() => {
    clearPing()
    pingIntervalRef.current = setInterval(async () => {
      if (!streamIdRef.current) return
      const ok = await pingStreamApi(streamIdRef.current)
      if (!ok) {
        clearPing()
        streamIdRef.current = null
        setSessionKilled(true)
      }
    }, 60 * 1000)
  }, [clearPing])

  const startStream = useCallback(
    async (
      profileId: string,
      tmdbId: number,
      type: 'movie' | 'series',
      title: string,
    ): Promise<StartStreamResult> => {
      const result = await startStreamApi({ profileId, tmdbId, type, title })

      if (result.ok) {
        streamIdRef.current = result.streamId
        setSessionKilled(false)
        startPing()
      }

      return result
    },
    [startPing],
  )

  const stopStream = useCallback(async () => {
    clearPing()
    if (streamIdRef.current) {
      await stopStreamApi(streamIdRef.current)
      streamIdRef.current = null
    }
  }, [clearPing])

  const killRemoteStream = useCallback(async (streamId: string) => {
    await killStreamApi(streamId)
  }, [])

  return {
    startStream,
    stopStream,
    killRemoteStream,
    sessionKilled,
  }
}
