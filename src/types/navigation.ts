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
  Favorites: undefined
  History: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainTabParamList = {
  Home: undefined
  Movies: undefined
  Series: undefined
  Search: undefined
  Settings: undefined
}
