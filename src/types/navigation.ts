export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  MovieDetail: { id: number }
  SeriesDetail: { id: number }
  Player: {
    id: number
    type: 'movie' | 'series'
    title: string
    posterPath: string | null
    runtimeSeconds: number
    season?: number
    episode?: number
  }
  Search: undefined
  ProfileSelection: undefined
  ProfileForm: { profileId?: string }
  Account: undefined
  ChangePassword: undefined
  Plans: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

export type MainTabParamList = {
  Home: undefined
  Movies: undefined
  Series: undefined
  Profile: undefined
}
