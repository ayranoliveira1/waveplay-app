import React, { useCallback, useState } from 'react'
import { ScrollView, ActivityIndicator, View, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AnimatedSection, HeroBanner, MediaCard, Carousel, ContinueWatchingCard } from '../components'
import {
  getTrendingAll,
  getPopularMovies,
  getPopularSeries,
  getNowPlayingMovies,
} from '../services/tmdb'
import { useHistory } from '../hooks'
import type { RootStackParamList, TMDBMovie, TMDBSeries, TMDBMultiSearchResult, HistoryItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()

  const { history, reload: reloadHistory } = useHistory()

  useFocusEffect(
    useCallback(() => {
      reloadHistory()
    }, [reloadHistory]),
  )

  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: trending, isLoading: trendingLoading, refetch: refetchTrending } = useQuery({
    queryKey: ['trending', 'all'],
    queryFn: () => getTrendingAll(),
  })

  const { data: popularMovies, refetch: refetchPopular } = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => getPopularMovies(),
  })

  const { data: popularSeries, refetch: refetchSeries } = useQuery({
    queryKey: ['series', 'popular'],
    queryFn: () => getPopularSeries(),
  })

  const { data: nowPlaying, refetch: refetchNowPlaying } = useQuery({
    queryKey: ['movies', 'now_playing'],
    queryFn: () => getNowPlayingMovies(),
  })

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refetchTrending(),
      refetchPopular(),
      refetchSeries(),
      refetchNowPlaying(),
      reloadHistory(),
    ])
    setRefreshKey((k) => k + 1)
    setRefreshing(false)
  }, [refetchTrending, refetchPopular, refetchSeries, refetchNowPlaying, reloadHistory])

  function handleMediaPress(id: number, type: 'movie' | 'series') {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { id })
    } else {
      navigation.navigate('SeriesDetail', { id })
    }
  }

  const heroItem = trending?.results[0]

  if (trendingLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#7B2FBE"
          colors={['#7B2FBE']}
        />
      }
    >
      {heroItem && (
        <AnimatedSection key={`hero-${refreshKey}`} delay={0}>
          <HeroBanner
            id={heroItem.id}
            type={heroItem.media_type === 'tv' ? 'series' : 'movie'}
            title={heroItem.title || heroItem.name || ''}
            overview={heroItem.overview}
            backdropPath={heroItem.backdrop_path}
            posterPath={heroItem.poster_path}
            rating={heroItem.vote_average}
            onPress={() =>
              handleMediaPress(
                heroItem.id,
                heroItem.media_type === 'tv' ? 'series' : 'movie',
              )
            }
          />
        </AnimatedSection>
      )}

      {history.length > 0 && (
        <AnimatedSection key={`history-${refreshKey}`} delay={100}>
          <Carousel
            title="Continuar Assistindo"
            data={history.slice(0, 10)}
            keyExtractor={(item: HistoryItem) => `history-${item.id}-${item.type}`}
            renderItem={(item: HistoryItem) => (
              <ContinueWatchingCard item={item} onPress={handleMediaPress} />
            )}
          />
        </AnimatedSection>
      )}

      {trending && (
        <AnimatedSection key={`trending-${refreshKey}`} delay={200}>
          <Carousel
            title="Em Alta"
            data={trending.results.slice(1, 15)}
            keyExtractor={(item: TMDBMultiSearchResult) => `trending-${item.id}`}
            renderItem={(item: TMDBMultiSearchResult) => (
              <MediaCard
                id={item.id}
                title={item.title || item.name || ''}
                posterPath={item.poster_path}
                rating={item.vote_average}
                type={item.media_type === 'tv' ? 'series' : 'movie'}
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      {popularMovies && (
        <AnimatedSection key={`popular-${refreshKey}`} delay={300}>
          <Carousel
            title="Filmes Populares"
            data={popularMovies.results.slice(0, 15)}
            keyExtractor={(item: TMDBMovie) => `pop-movie-${item.id}`}
            renderItem={(item: TMDBMovie) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.poster_path}
                rating={item.vote_average}
                type="movie"
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      {popularSeries && (
        <AnimatedSection key={`series-${refreshKey}`} delay={400}>
          <Carousel
            title="Séries Populares"
            data={popularSeries.results.slice(0, 15)}
            keyExtractor={(item: TMDBSeries) => `pop-series-${item.id}`}
            renderItem={(item: TMDBSeries) => (
              <MediaCard
                id={item.id}
                title={item.name}
                posterPath={item.poster_path}
                rating={item.vote_average}
                type="series"
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      {nowPlaying && (
        <AnimatedSection key={`now-${refreshKey}`} delay={500}>
          <Carousel
            title="Em Cartaz"
            data={nowPlaying.results.slice(0, 15)}
            keyExtractor={(item: TMDBMovie) => `now-${item.id}`}
            renderItem={(item: TMDBMovie) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.poster_path}
                rating={item.vote_average}
                type="movie"
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      <View className="h-8" />
    </ScrollView>
  )
}
