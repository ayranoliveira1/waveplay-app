import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { Episode, ProgressEntry } from '../types'

interface EpisodeCardProps {
  episode: Episode
  onPress: (episode: Episode) => void
  progress?: ProgressEntry | null
}

export function EpisodeCard({ episode, onPress, progress }: EpisodeCardProps) {
  const imageUri = episode.stillPath
    ? `${TMDB_IMAGE_SIZES.still.medium}${episode.stillPath}`
    : null

  const percent =
    progress && progress.durationSeconds > 0
      ? progress.progressSeconds / progress.durationSeconds
      : 0
  const isWatched = percent >= 0.9

  return (
    <Pressable
      onPress={() => onPress(episode)}
      className="mb-3 overflow-hidden rounded-card bg-background-secondary"
    >
      <View className="flex-row">
        <View className="h-20 w-35">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 140, height: 80 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-background-tertiary">
              <Text className="text-xl text-text-muted">▶</Text>
            </View>
          )}
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            {isWatched ? (
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            ) : (
              <Text className="text-2xl text-white">▶</Text>
            )}
          </View>
        </View>
        <View className="flex-1 justify-center px-3 py-2">
          <Text className="text-xs text-text-muted">
            Episódio {episode.episodeNumber}
          </Text>
          <Text className="text-sm font-medium text-white" numberOfLines={1}>
            {episode.name}
          </Text>
          {episode.runtime ? (
            <Text className="mt-1 text-xs text-text-muted">
              {episode.runtime} min
            </Text>
          ) : null}
          {percent > 0 && (
            <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-background-tertiary">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(percent * 100, 100)}%` }}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}
