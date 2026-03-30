import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '../constants/api'
import type {
  TMDBResponse,
  TMDBMovie,
  TMDBSeries,
  TMDBMovieDetail,
  TMDBSeriesDetail,
  TMDBSeasonDetail,
  TMDBMultiSearchResult,
} from '../types'

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    language: 'pt-BR',
    ...params,
  })

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`)
  }

  return response.json()
}

// Movies
export function getTrendingMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/trending/movie/week', {
    page: String(page),
  })
}

export function getPopularMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/movie/popular', {
    page: String(page),
  })
}

export function getTopRatedMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/movie/top_rated', {
    page: String(page),
  })
}

export function getNowPlayingMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/movie/now_playing', {
    page: String(page),
  })
}

export function getUpcomingMovies(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/movie/upcoming', {
    page: String(page),
  })
}

export function getMovieDetail(id: number) {
  return fetchTMDB<TMDBMovieDetail>(`/movie/${id}`)
}

export function getSimilarMovies(id: number) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>(`/movie/${id}/similar`)
}

export function getMoviesByGenre(genreId: number, page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMovie>>('/discover/movie', {
    with_genres: String(genreId),
    page: String(page),
    sort_by: 'popularity.desc',
  })
}

// Series
export function getTrendingSeries(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/trending/tv/week', {
    page: String(page),
  })
}

export function getPopularSeries(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/tv/popular', {
    page: String(page),
  })
}

export function getTopRatedSeries(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/tv/top_rated', {
    page: String(page),
  })
}

export function getAiringTodaySeries(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/tv/airing_today', {
    page: String(page),
  })
}

export function getOnTheAirSeries(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/tv/on_the_air', {
    page: String(page),
  })
}

export function getSeriesDetail(id: number) {
  return fetchTMDB<TMDBSeriesDetail>(`/tv/${id}`)
}

export function getSeasonDetail(seriesId: number, seasonNumber: number) {
  return fetchTMDB<TMDBSeasonDetail>(`/tv/${seriesId}/season/${seasonNumber}`)
}

export function getSimilarSeries(id: number) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>(`/tv/${id}/similar`)
}

export function getSeriesByGenre(genreId: number, page = 1) {
  return fetchTMDB<TMDBResponse<TMDBSeries>>('/discover/tv', {
    with_genres: String(genreId),
    page: String(page),
    sort_by: 'popularity.desc',
  })
}

// Search
export function searchMulti(query: string, page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMultiSearchResult>>('/search/multi', {
    query,
    page: String(page),
  })
}

// Genres
export function getMovieGenres() {
  return fetchTMDB<{ genres: { id: number; name: string }[] }>('/genre/movie/list')
}

export function getSeriesGenres() {
  return fetchTMDB<{ genres: { id: number; name: string }[] }>('/genre/tv/list')
}

// Trending All
export function getTrendingAll(page = 1) {
  return fetchTMDB<TMDBResponse<TMDBMultiSearchResult>>('/trending/all/week', {
    page: String(page),
  })
}
