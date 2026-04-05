import React, { useCallback, useState } from 'react'
import { ScrollView, ActivityIndicator, View, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AnimatedSection, HeroBanner, MediaCard, Carousel, ContinueWatchingCard, ScreenHeader } from '../components'
import { ErrorState } from '../components/ui'
import {
  getTrending,
  getPopularMovies,
  getPopularSeries,
  getNowPlayingMovies,
  getTopRatedMovies,
} from '../services/catalog'
import { useHistory } from '../hooks'
import type { RootStackParamList, CatalogItem, HistoryItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()

  const { history, reload: reloadHistory } = useHistory()

  const continueWatching = history.filter(
    (h) =>
      h.progressSeconds &&
      h.durationSeconds &&
      h.progressSeconds / h.durationSeconds < 0.9,
  )

  useFocusEffect(
    useCallback(() => {
      reloadHistory()
    }, [reloadHistory]),
  )

  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: trending, isLoading: trendingLoading, isError: trendingError, refetch: refetchTrending } = useQuery({
    queryKey: ['trending', 'all'],
    queryFn: () => getTrending(),
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

  const { data: topRated, refetch: refetchTopRated } = useQuery({
    queryKey: ['movies', 'top_rated'],
    queryFn: () => getTopRatedMovies(),
  })

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refetchTrending(),
      refetchPopular(),
      refetchSeries(),
      refetchNowPlaying(),
      refetchTopRated(),
      reloadHistory(),
    ])
    setRefreshKey((k) => k + 1)
    setRefreshing(false)
  }, [refetchTrending, refetchPopular, refetchSeries, refetchNowPlaying, refetchTopRated, reloadHistory])

  function handleMediaPress(id: number, type: 'movie' | 'series') {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { id })
    } else {
      navigation.navigate('SeriesDetail', { id })
    }
  }

  if (trendingLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  if (trendingError) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader title="Início" />
        <ErrorState onRetry={() => refetchTrending()} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Início" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#7B2FBE"
            colors={['#7B2FBE']}
          />
        }
      >
      {trending && (
        <AnimatedSection key={`hero-${refreshKey}`} delay={0}>
          <HeroBanner
            items={trending.results.slice(0, 5).map((item) => ({
              id: item.id,
              type: item.type,
              title: item.title,
              overview: item.overview ?? '',
              backdropPath: item.backdropPath,
              posterPath: item.posterPath,
              rating: item.rating,
            }))}
            onPressItem={handleMediaPress}
          />
        </AnimatedSection>
      )}

      {continueWatching.length > 0 && (
        <AnimatedSection key={`history-${refreshKey}`} delay={100}>
          <Carousel
            title="Continuar Assistindo"
            data={continueWatching.slice(0, 10)}
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
            keyExtractor={(item: CatalogItem) => `trending-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
                type={item.type}
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
            keyExtractor={(item: CatalogItem) => `pop-movie-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
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
            keyExtractor={(item: CatalogItem) => `pop-series-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
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
            keyExtractor={(item: CatalogItem) => `now-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
                type="movie"
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      {topRated && (
        <AnimatedSection key={`toprated-${refreshKey}`} delay={600}>
          <Carousel
            title="Mais Bem Avaliados"
            data={topRated.results.slice(0, 15)}
            keyExtractor={(item: CatalogItem) => `toprated-${item.id}`}
            renderItem={(item: CatalogItem) => (
              <MediaCard
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                rating={item.rating}
                type="movie"
                onPress={handleMediaPress}
              />
            )}
          />
        </AnimatedSection>
      )}

      <View className="h-8" />
    </ScrollView>
    </View>
  )
}
