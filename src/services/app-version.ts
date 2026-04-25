import { api } from './api'

export interface AppVersionResponse {
  version: string
  downloadUrl: string
  forceUpdate: boolean
  releaseNotes: string | null
}

// Service publico — consumido pelo hook useAppVersionCheck no boot do app.
// Endpoint sem auth (vem do BC mobile-app no backend, Task 31).
export const appVersion = {
  getCurrent: () => api.get<AppVersionResponse>('/app/version'),
}
