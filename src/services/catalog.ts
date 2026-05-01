import { api } from './api'
import type {
  CatalogList,
  CatalogMovieDetail,
  CatalogSeriesDetail,
  CatalogEpisode,
} from '../types'

async function catalogGet<T>(path: string): Promise<T> {
  const response = await api.get<T>(path)
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro no catálogo')
  }
  return response.data
}

// Trending
export function getTrending(page = 1) {
  return catalogGet<CatalogList>(`/catalog/trending?page=${page}`)
}

// Movies — lists
export function getPopularMovies(page = 1) {
  return catalogGet<CatalogList>(`/catalog/movies/popular?page=${page}`)
}

export function getTopRatedMovies(page = 1) {
  return catalogGet<CatalogList>(`/catalog/movies/top-rated?page=${page}`)
}

export function getNowPlayingMovies(page = 1) {
  return catalogGet<CatalogList>(`/catalog/movies/now-playing?page=${page}`)
}

export function getUpcomingMovies(page = 1) {
  return catalogGet<CatalogList>(`/catalog/movies/upcoming?page=${page}`)
}

export function getMoviesByGenre(genreId: number, page = 1) {
  return catalogGet<CatalogList>(
    `/catalog/movies/genre/${genreId}?page=${page}`,
  )
}

export function getSimilarMovies(id: number) {
  return catalogGet<CatalogList>(`/catalog/movies/${id}/similar`)
}

// Movies — detail
export function getMovieDetail(id: number) {
  return catalogGet<{ movie: CatalogMovieDetail }>(`/catalog/movies/${id}`)
}

// Series — lists
export function getPopularSeries(page = 1) {
  return catalogGet<CatalogList>(`/catalog/series/popular?page=${page}`)
}

export function getTopRatedSeries(page = 1) {
  return catalogGet<CatalogList>(`/catalog/series/top-rated?page=${page}`)
}

export function getAiringTodaySeries(page = 1) {
  return catalogGet<CatalogList>(`/catalog/series/airing-today?page=${page}`)
}

export function getOnTheAirSeries(page = 1) {
  return catalogGet<CatalogList>(`/catalog/series/on-the-air?page=${page}`)
}

export function getSeriesByGenre(genreId: number, page = 1) {
  return catalogGet<CatalogList>(
    `/catalog/series/genre/${genreId}?page=${page}`,
  )
}

export function getSimilarSeries(id: number) {
  return catalogGet<CatalogList>(`/catalog/series/${id}/similar`)
}

// Series — detail
export function getSeriesDetail(id: number) {
  return catalogGet<{ series: CatalogSeriesDetail }>(
    `/catalog/series/${id}`,
  )
}

export function getSeasonDetail(seriesId: number, seasonNumber: number) {
  return catalogGet<{ episodes: CatalogEpisode[] }>(
    `/catalog/series/${seriesId}/seasons/${seasonNumber}`,
  )
}

// Search
export function searchCatalog(query: string, page = 1) {
  return catalogGet<CatalogList>(
    `/catalog/search?q=${encodeURIComponent(query)}&page=${page}`,
  )
}

// Genres
export function getMovieGenres() {
  return catalogGet<{ genres: { id: number; name: string }[] }>(
    '/catalog/genres/movies',
  )
}

export function getSeriesGenres() {
  return catalogGet<{ genres: { id: number; name: string }[] }>(
    '/catalog/genres/series',
  )
}

// Watch providers
export function getByWatchProviders(providerId: number, page = 1) {
  return catalogGet<CatalogList>(
    `/catalog/by-watch-providers?providers=${providerId}&page=${page}`,
  )
}
