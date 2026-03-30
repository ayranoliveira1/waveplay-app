import React, { useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { RatingBadge } from './RatingBadge'

interface MediaCardProps {
  id: number
  title: string
  posterPath: string | null
  rating?: number
  progress?: number
  subtitle?: string
  type: 'movie' | 'series'
  onPress: (id: number, type: 'movie' | 'series') => void
}

export function MediaCard({
  id,
  title,
  posterPath,
  rating,
  progress,
  subtitle,
  type,
  onPress,
}: MediaCardProps) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const imageUri = posterPath
    ? `${TMDB_IMAGE_SIZES.poster.medium}${posterPath}`
    : null

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress(id, type)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className="mr-3 w-35"
      >
        <View className="overflow-hidden rounded-poster">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 140, height: 210 }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="h-52.5 w-35 items-center justify-center bg-background-secondary">
              <Text className="text-text-muted">Sem imagem</Text>
            </View>
          )}
          {rating != null && rating > 0 && (
            <View className="absolute right-2 top-2">
              <RatingBadge rating={rating} />
            </View>
          )}
          {progress != null && progress > 0 && (
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <View
                className="h-full bg-accent"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
          )}
        </View>
        <Text
          className="mt-2 text-sm font-medium text-white"
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-0.5 text-xs text-text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  )
}
