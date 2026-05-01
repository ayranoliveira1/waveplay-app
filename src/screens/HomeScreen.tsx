import React, { useCallback, useMemo, useState } from 'react'
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
  getByWatchProviders,
} from '../services/catalog'
import { useHistory } from '../hooks'
import { WATCH_PROVIDERS } from '../constants/watch-providers'
import type { RootStackParamList, CatalogItem, HistoryItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()

  const { history, reload: reloadHistory } = useHistory()

  const continueWatching = useMemo(
    () =>
      history
        .map((h) => {
          if (!h.progressSeconds || !h.durationSeconds) return null
          const percent = h.progressSeconds / h.durationSeconds

          if (percent < 0.9) return h

          if (h.type === 'series' && h.lastEpisode != null) {
            return {
              ...h,
              lastEpisode: h.lastEpisode + 1,
              progressSeconds: 0,
              durationSeconds: 0,
            }
          }

          return null
        })
        .filter((h): h is HistoryItem => h !== null),
    [history],
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

  const { data: netflixCatalog, refetch: refetchNetflix } = useQuery({
    queryKey: ['catalog', 'watch-provider', 'netflix'],
    queryFn: () => getByWatchProviders(8),
  })

  const { data: disneyCatalog, refetch: refetchDisney } = useQuery({
    queryKey: ['catalog', 'watch-provider', 'disney-plus'],
    queryFn: () => getByWatchProviders(337),
  })

  const { data: maxCatalog, refetch: refetchMax } = useQuery({
    queryKey: ['catalog', 'watch-provider', 'max'],
    queryFn: () => getByWatchProviders(1899),
  })

  const { data: primeCatalog, refetch: refetchPrime } = useQuery({
    queryKey: ['catalog', 'watch-provider', 'prime-video'],
    queryFn: () => getByWatchProviders(119),
  })

  const watchProviderData = {
    netflix: netflixCatalog,
    'disney-plus': disneyCatalog,
    max: maxCatalog,
    'prime-video': primeCatalog,
  } as const

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      refetchTrending(),
      refetchPopular(),
      refetchSeries(),
      refetchNowPlaying(),
      refetchTopRated(),
      refetchNetflix(),
      refetchDisney(),
      refetchMax(),
      refetchPrime(),
      reloadHistory(),
    ])
    setRefreshKey((k) => k + 1)
    setRefreshing(false)
  }, [
    refetchTrending,
    refetchPopular,
    refetchSeries,
    refetchNowPlaying,
    refetchTopRated,
    refetchNetflix,
    refetchDisney,
    refetchMax,
    refetchPrime,
    reloadHistory,
  ])

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
            keyExtractor={(item: HistoryItem) => `history-${item.id}-${item.type}-${item.lastSeason ?? 0}-${item.lastEpisode ?? 0}`}
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

      {WATCH_PROVIDERS.map((provider, idx) => {
        const data =
          watchProviderData[provider.slug as keyof typeof watchProviderData]
        if (!data || data.results.length === 0) return null
        const delay = 700 + idx * 100
        return (
          <AnimatedSection
            key={`${provider.slug}-${refreshKey}`}
            delay={delay}
          >
            <Carousel
              title={provider.title}
              data={data.results}
              keyExtractor={(item: CatalogItem) =>
                `${provider.slug}-${item.type}-${item.id}`
              }
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
        )
      })}

      <View className="h-8" />
    </ScrollView>
    </View>
  )
}
