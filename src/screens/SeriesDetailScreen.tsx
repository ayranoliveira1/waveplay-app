import React, { useState } from 'react'
import { ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Button, ErrorState } from '../components/ui'
import { SeasonPicker, EpisodeCard, BackButton, Carousel, MediaCard, SubscriptionBanner } from '../components'
import { getSeriesDetail, getSeasonDetail, getSimilarSeries } from '../services/catalog'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useFavorites, useWatchlist, useProgress, useSubscription, formatTime } from '../hooks'
import type { RootStackParamList, Episode, CatalogItem } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>
type SeriesDetailRoute = RouteProp<RootStackParamList, 'SeriesDetail'>

export function SeriesDetailScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<SeriesDetailRoute>()
  const { id } = route.params
  const insets = useSafeAreaInsets()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
  const { getAllProgressForSeries, getProgress } = useProgress()
  const { canWatch, isExpired } = useSubscription()
  const [selectedSeason, setSelectedSeason] = useState(1)

  const seriesProgress = getAllProgressForSeries(id)

  const { data: seriesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['series', id],
    queryFn: () => getSeriesDetail(id),
  })

  const series = seriesData?.series

  const { data: seasonDetail } = useQuery({
    queryKey: ['series', id, 'season', selectedSeason],
    queryFn: () => getSeasonDetail(id, selectedSeason),
    enabled: !!series,
  })

  const { data: similarData } = useQuery({
    queryKey: ['series', id, 'similar'],
    queryFn: () => getSimilarSeries(id),
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  if (isError || !series) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2">
          <BackButton variant="inline" />
        </View>
        <ErrorState onRetry={() => refetch()} />
      </View>
    )
  }

  const isFav = isFavorite(id, 'series')
  const inWatchlist = isInWatchlist(id, 'series')
  const backdropUri = series.backdropPath
    ? `${TMDB_IMAGE_SIZES.backdrop.large}${series.backdropPath}`
    : null

  function handleToggleFavorite() {
    if (isFav) {
      removeFavorite(id, 'series')
    } else {
      addFavorite({
        id: series!.id,
        title: series!.name,
        posterPath: series!.posterPath,
        backdropPath: series!.backdropPath,
        rating: series!.rating,
        type: 'series',
      })
    }
  }

  function handleToggleWatchlist() {
    if (inWatchlist) {
      removeFromWatchlist(id, 'series')
    } else {
      addToWatchlist({
        id: series!.id,
        title: series!.name,
        posterPath: series!.posterPath,
        backdropPath: series!.backdropPath,
        rating: series!.rating,
        type: 'series',
      })
    }
  }

  function handleMediaPress(mediaId: number, type: 'movie' | 'series') {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { id: mediaId })
    } else {
      navigation.navigate('SeriesDetail', { id: mediaId })
    }
  }

  function handleEpisodePress(ep: Episode) {
    if (!canWatch) return
    navigation.navigate('Player', {
      id,
      type: 'series',
      title: series!.name,
      posterPath: series!.posterPath,
      runtimeSeconds: (ep.runtime || 45) * 60,
      season: ep.seasonNumber,
      episode: ep.episodeNumber,
    })
  }

  // Find last watched episode for continue button
  const lastWatchedKey = Object.keys(seriesProgress).sort(
    (a, b) =>
      new Date(seriesProgress[b].updatedAt).getTime() -
      new Date(seriesProgress[a].updatedAt).getTime(),
  )[0]
  const lastWatchedMatch = lastWatchedKey?.match(/series-\d+-(\d+)-(\d+)/)
  const lastSeason = lastWatchedMatch ? Number(lastWatchedMatch[1]) : null
  const lastEpisode = lastWatchedMatch ? Number(lastWatchedMatch[2]) : null
  const lastProgress = lastWatchedKey ? seriesProgress[lastWatchedKey] : null
  const lastPercent =
    lastProgress && lastProgress.durationSeconds > 0
      ? lastProgress.progressSeconds / lastProgress.durationSeconds
      : 0
  const canContinue = lastProgress && lastPercent > 0 && lastPercent < 0.9

  const episodes: Episode[] = seasonDetail?.episodes ?? []

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View style={{ height: 300 }}>
        {backdropUri && (
          <Image
            source={{ uri: backdropUri }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
            transition={500}
          />
        )}
        <LinearGradient
          colors={['transparent', '#0A0A0F']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
          }}
        />
        <View style={{ top: insets.top + 8 }} className="absolute left-4">
          <BackButton />
        </View>
        {!canWatch && <SubscriptionBanner isExpired={isExpired} />}
      </View>

      <View className="px-4">
        <Text className="text-2xl font-bold text-white">{series.name}</Text>

        <View className="mt-2 flex-row flex-wrap items-center">
          <View className="mr-3 flex-row items-center">
            <Text className="text-xs text-rating">★</Text>
            <Text className="ml-1 text-sm font-bold text-white">
              {series.rating.toFixed(1)}
            </Text>
          </View>
          <Text className="mr-3 text-sm text-text-secondary">
            {series.firstAirDate?.split('-')[0]}
          </Text>
          <Text className="mr-3 text-sm text-text-secondary">
            {series.numberOfSeasons} Temporada{series.numberOfSeasons > 1 ? 's' : ''}
          </Text>
        </View>

        {series.genres.length > 0 && (
          <View className="mt-2 flex-row flex-wrap">
            {series.genres.map((genre) => (
              <View
                key={genre.id}
                className="mb-1 mr-2 rounded-chip bg-background-tertiary px-3 py-1"
              >
                <Text className="text-xs text-text-secondary">
                  {genre.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            {!canWatch ? (
              <Button
                title="🔒 Assistir"
                onPress={() => {}}
                disabled
              />
            ) : canContinue ? (
              <Button
                title={`▶ Continuar T${lastSeason} E${lastEpisode} - ${formatTime(lastProgress!.progressSeconds)}`}
                onPress={() => {
                  navigation.navigate('Player', {
                    id,
                    type: 'series',
                    title: series!.name,
                    posterPath: series!.posterPath,
                    runtimeSeconds: lastProgress!.durationSeconds || 45 * 60,
                    season: lastSeason!,
                    episode: lastEpisode!,
                  })
                }}
              />
            ) : (
              <Button
                title={`▶ Assistir T${selectedSeason} E1`}
                onPress={() => {
                  const firstEp = episodes[0]
                  navigation.navigate('Player', {
                    id,
                    type: 'series',
                    title: series!.name,
                    posterPath: series!.posterPath,
                    runtimeSeconds: (firstEp?.runtime || 45) * 60,
                    season: selectedSeason,
                    episode: 1,
                  })
                }}
              />
            )}
          </View>
          <Pressable
            onPress={handleToggleFavorite}
            className="items-center justify-center rounded-button bg-background-secondary px-4"
          >
            <Text className="text-xl">{isFav ? '❤️' : '🤍'}</Text>
          </Pressable>
          <Pressable
            onPress={handleToggleWatchlist}
            className="items-center justify-center rounded-button bg-background-secondary px-4"
          >
            <Ionicons
              name={inWatchlist ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {series.tagline ? (
          <Text className="mt-4 text-sm italic text-text-muted">
            "{series.tagline}"
          </Text>
        ) : null}

        <Text className="mt-3 text-base leading-6 text-text-secondary">
          {series.overview}
        </Text>
      </View>

      <View className="mt-6">
        <Text className="mb-3 px-4 text-lg font-bold text-white">
          Episódios
        </Text>

        <SeasonPicker
          seasons={series.seasons.map((s) => ({ ...s, overview: '' }))}
          selectedSeason={selectedSeason}
          onSelect={setSelectedSeason}
        />

        <View className="px-4">
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              onPress={handleEpisodePress}
              progress={
                seriesProgress[`series-${id}-${ep.seasonNumber}-${ep.episodeNumber}`] ?? null
              }
            />
          ))}
        </View>
      </View>

      {similarData && similarData.results.length > 0 && (
        <View className="mt-6">
          <Carousel
            title="Séries Similares"
            data={similarData.results.slice(0, 15)}
            keyExtractor={(item: CatalogItem) => `similar-${item.id}`}
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
        </View>
      )}

      <View style={{ height: insets.bottom + 16 }} />
    </ScrollView>
  )
}
