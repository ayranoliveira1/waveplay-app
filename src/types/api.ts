export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDBMovie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  overview: string
  release_date: string
  genre_ids: number[]
  original_language: string
  adult: boolean
  popularity: number
}

export interface TMDBSeries {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  overview: string
  first_air_date: string
  genre_ids: number[]
  original_language: string
  popularity: number
}

export interface TMDBMovieDetail {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  overview: string
  release_date: string
  genres: { id: number; name: string }[]
  runtime: number
  tagline: string
  status: string
  original_language: string
}

export interface TMDBSeriesDetail {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  overview: string
  first_air_date: string
  genres: { id: number; name: string }[]
  tagline: string
  status: string
  number_of_seasons: number
  number_of_episodes: number
  seasons: TMDBSeason[]
  original_language: string
}

export interface TMDBSeason {
  id: number
  season_number: number
  name: string
  episode_count: number
  poster_path: string | null
  air_date: string | null
  overview: string
}

export interface TMDBEpisode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  still_path: string | null
  air_date: string | null
  runtime: number | null
  vote_average: number
}

export interface TMDBSeasonDetail {
  id: number
  season_number: number
  name: string
  episodes: TMDBEpisode[]
}

export interface TMDBMultiSearchResult {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  overview: string
  release_date?: string
  first_air_date?: string
  genre_ids: number[]
}

export interface EmbedStatus {
  result: boolean
}
