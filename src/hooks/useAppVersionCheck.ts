import { useEffect, useRef, useState } from 'react'
import * as Application from 'expo-application'
import semver from 'semver'
import { appVersion } from '../services/app-version'

// Global injetado pelo Metro bundler em React Native.
declare const __DEV__: boolean

type Status = 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'error'

export interface UseAppVersionCheckResult {
  status: Status
  currentVersion: string | null
  latestVersion: string | null
  downloadUrl: string | null
  forceUpdate: boolean
  releaseNotes: string | null
}

const TIMEOUT_MS = 10_000

function compareIsOlder(current: string, latest: string): boolean | null {
  try {
    return semver.lt(current, latest)
  } catch {
    return null
  }
}

export function useAppVersionCheck(): UseAppVersionCheckResult {
  const didCheck = useRef(false)
  const [state, setState] = useState<UseAppVersionCheckResult>(() => ({
    status: 'idle',
    currentVersion: Application.nativeApplicationVersion,
    latestVersion: null,
    downloadUrl: null,
    forceUpdate: false,
    releaseNotes: null,
  }))

  useEffect(() => {
    if (didCheck.current) return
    didCheck.current = true

    // Em DEV, ignora o check para nao atrapalhar desenvolvimento local.
    if (__DEV__) {
      setState((s) => ({ ...s, status: 'up-to-date' }))
      return
    }

    setState((s) => ({ ...s, status: 'checking' }))

    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      setState((s) => ({ ...s, status: 'error' }))
    }, TIMEOUT_MS)

    appVersion
      .getCurrent()
      .then((res) => {
        if (timedOut) return
        clearTimeout(timeoutId)

        if (!res.success) {
          // 404 NoCurrentVersionError ou outro erro — abre app sem modal.
          setState((s) => ({ ...s, status: 'error' }))
          return
        }

        const current = Application.nativeApplicationVersion ?? '0.0.0'
        const latest = res.data.version
        const isOlder = compareIsOlder(current, latest)

        if (isOlder === null) {
          // Semver invalido em algum lado — silencioso, abre app.
          setState((s) => ({ ...s, status: 'error' }))
          return
        }

        if (isOlder) {
          setState({
            status: 'update-available',
            currentVersion: current,
            latestVersion: latest,
            downloadUrl: res.data.downloadUrl,
            forceUpdate: res.data.forceUpdate,
            releaseNotes: res.data.releaseNotes,
          })
        } else {
          setState((s) => ({
            ...s,
            status: 'up-to-date',
            latestVersion: latest,
          }))
        }
      })
      .catch(() => {
        if (timedOut) return
        clearTimeout(timeoutId)
        setState((s) => ({ ...s, status: 'error' }))
      })

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  return state
}
