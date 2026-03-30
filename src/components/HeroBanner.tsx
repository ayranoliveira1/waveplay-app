import React from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useFavorites } from '../hooks'

interface HeroBannerProps {
  id: number
  type: 'movie' | 'series'
  title: string
  overview: string
  backdropPath: string | null
  posterPath: string | null
  rating: number
  onPress: () => void
}

export function HeroBanner({
  id,
  type,
  title,
  overview,
  backdropPath,
  posterPath,
  rating,
  onPress,
}: HeroBannerProps) {
  const { width } = useWindowDimensions()
  const bannerHeight = Math.round(width * 0.7)
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const isFav = isFavorite(id, type)

  function handleToggleFavorite() {
    if (isFav) {
      removeFavorite(id, type)
    } else {
      addFavorite({
        id,
        title,
        posterPath,
        backdropPath,
        rating,
        type,
      })
    }
  }

  const imageUri = backdropPath
    ? `${TMDB_IMAGE_SIZES.backdrop.large}${backdropPath}`
    : null

  return (
    <Pressable onPress={onPress} className="mb-6">
      <View style={{ width, height: bannerHeight }}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width, height: bannerHeight }}
            contentFit="cover"
            transition={500}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,0.8)', '#0A0A0F']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: bannerHeight * 0.6,
          }}
        />
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 flex-row items-center rounded-full bg-rating/20 px-2 py-0.5">
              <Text className="mr-1 text-xs text-rating">★</Text>
              <Text className="text-xs font-bold text-rating">
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text className="mb-2 text-2xl font-bold text-white">{title}</Text>
          <Text className="text-sm text-text-secondary" numberOfLines={2}>
            {overview}
          </Text>
          <View className="mt-3 flex-row items-center gap-3">
            <View className="flex-row items-center rounded-button bg-accent px-6 py-3">
              <Text className="text-base font-semibold text-white">
                ▶ Assistir
              </Text>
            </View>
            <Pressable
              onPress={handleToggleFavorite}
              className="items-center justify-center rounded-button bg-white/20 px-4 py-3"
            >
              <Text className="text-xl">{isFav ? '❤️' : '🤍'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  )
}
