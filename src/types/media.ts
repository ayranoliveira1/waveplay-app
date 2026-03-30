export interface MediaItem {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  type: 'movie' | 'series'
}

export interface MovieBasic extends MediaItem {
  type: 'movie'
  year: string
  releaseDate: string
}

export interface SeriesBasic extends MediaItem {
  type: 'series'
  firstAirDate: string
  year: string
}

export interface Genre {
  id: number
  name: string
}

export interface MovieDetail extends MovieBasic {
  overview: string
  runtime: number
  genres: Genre[]
  tagline: string
  status: string
  voteCount: number
  originalLanguage: string
}

export interface Season {
  id: number
  seasonNumber: number
  name: string
  episodeCount: number
  posterPath: string | null
  airDate: string | null
  overview: string
}

export interface Episode {
  id: number
  name: string
  overview: string
  episodeNumber: number
  seasonNumber: number
  stillPath: string | null
  airDate: string | null
  runtime: number | null
  voteAverage: number
}

export interface SeriesDetail extends SeriesBasic {
  overview: string
  genres: Genre[]
  tagline: string
  status: string
  voteCount: number
  numberOfSeasons: number
  numberOfEpisodes: number
  seasons: Season[]
  originalLanguage: string
}

export interface HistoryItem {
  id: number
  title: string
  posterPath: string | null
  type: 'movie' | 'series'
  watchedAt: string
  lastSeason?: number
  lastEpisode?: number
  progressSeconds?: number
  durationSeconds?: number
}

export interface ProgressEntry {
  progressSeconds: number
  durationSeconds: number
  updatedAt: string
}
