import React, { useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { formatTime } from '../hooks'
import type { HistoryItem } from '../types'

interface ContinueWatchingCardProps {
  item: HistoryItem
  onPress: (id: number, type: 'movie' | 'series') => void
}

export function ContinueWatchingCard({ item, onPress }: ContinueWatchingCardProps) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
  }

  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
  }

  const posterUri = item.posterPath
    ? `${TMDB_IMAGE_SIZES.poster.medium}${item.posterPath}`
    : null

  const progress =
    item.progressSeconds && item.durationSeconds
      ? Math.min(item.progressSeconds / item.durationSeconds, 1)
      : 0

  const episodeLabel =
    item.type === 'series' && item.lastSeason != null && item.lastEpisode != null
      ? `T${item.lastSeason} E${item.lastEpisode}`
      : null

  const timeLabel = item.progressSeconds
    ? formatTime(item.progressSeconds)
    : null

  const durationLabel = item.durationSeconds
    ? formatTime(item.durationSeconds)
    : null

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress(item.id, item.type)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className="mr-3 w-40 overflow-hidden rounded-card"
      >
        {/* Poster */}
        <View className="relative">
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={{ width: 160, height: 220 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              className="items-center justify-center bg-background-secondary"
              style={{ width: 160, height: 220 }}
            >
              <Text className="text-text-muted">Sem imagem</Text>
            </View>
          )}

          {/* Gradient overlay at bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />

          {/* Episode badge */}
          {episodeLabel && (
            <View className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5">
              <Text className="text-xs font-bold text-white">{episodeLabel}</Text>
            </View>
          )}

          {/* Play icon + time overlay */}
          <View className="absolute bottom-2 left-2 right-2">
            <View className="flex-row items-center">
              <Text className="text-lg text-white">▶</Text>
              {timeLabel && (
                <Text className="ml-1.5 text-xs font-medium text-white/90">
                  {timeLabel}
                  {durationLabel ? ` / ${durationLabel}` : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Progress bar */}
          {progress > 0 && (
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
          )}
        </View>

        {/* Title */}
        <View className="bg-background-secondary px-2 py-2">
          <Text className="text-xs font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}
