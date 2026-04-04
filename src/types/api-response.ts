export interface ApiResponse<T> {
  success: boolean
  data: T
  error: ApiError[] | null
}

export interface ApiError {
  message: string
  code?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserData {
  id: string
  name: string
  email: string
  createdAt: string
}
