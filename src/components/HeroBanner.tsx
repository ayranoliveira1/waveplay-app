import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import { useFavorites } from '../hooks'

interface HeroBannerItem {
  id: number
  type: 'movie' | 'series'
  title: string
  overview: string
  backdropPath: string | null
  posterPath: string | null
  rating: number
}

interface HeroBannerProps {
  items: HeroBannerItem[]
  onPressItem: (id: number, type: 'movie' | 'series') => void
}

const AUTO_ROTATE_INTERVAL = 4000
const RESUME_DELAY = 5000

const HeroBannerSlide = React.memo(function HeroBannerSlide({
  item,
  width,
  bannerHeight,
  onPress,
}: {
  item: HeroBannerItem
  width: number
  bannerHeight: number
  onPress: () => void
}) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const isFav = isFavorite(item.id, item.type)

  function handleToggleFavorite() {
    if (isFav) {
      removeFavorite(item.id, item.type)
    } else {
      addFavorite({
        id: item.id,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        rating: item.rating,
        type: item.type,
      })
    }
  }

  const imageUri = item.backdropPath
    ? `${TMDB_IMAGE_SIZES.backdrop.large}${item.backdropPath}`
    : null

  return (
    <Pressable onPress={onPress} style={{ width }}>
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
                {item.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text className="mb-2 text-2xl font-bold text-white">
            {item.title}
          </Text>
          <Text className="text-sm text-text-secondary" numberOfLines={2}>
            {item.overview}
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
})

export function HeroBanner({ items, onPressItem }: HeroBannerProps) {
  const { width } = useWindowDimensions()
  const bannerHeight = Math.round(width * 0.7)
  const itemCount = items.length

  const loopedItems = useMemo(
    () => [...items, ...items, ...items],
    [items],
  )

  const startIndex = itemCount
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indexRef = useRef(startIndex)
  const isUserDragging = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Auto-rotate com setInterval simples — apenas 1 timer ativo por vez
  const startAutoRotate = useCallback(() => {
    clearTimer()
    const tick = () => {
      timerRef.current = setTimeout(() => {
        const next = indexRef.current + 1

        // Teleportar silenciosamente se chegou no final
        if (next >= itemCount * 3) {
          const resetTo = itemCount + (next % itemCount)
          flatListRef.current?.scrollToOffset({
            offset: resetTo * width,
            animated: false,
          })
          indexRef.current = resetTo
          setActiveIndex(resetTo % itemCount)
          tick()
          return
        }

        indexRef.current = next
        setActiveIndex(next % itemCount)
        flatListRef.current?.scrollToIndex({ index: next, animated: true })
        tick()
      }, AUTO_ROTATE_INTERVAL)
    }
    tick()
  }, [itemCount, width, clearTimer])

  useEffect(() => {
    if (itemCount > 1) {
      startAutoRotate()
    }
    return clearTimer
  }, [itemCount, startAutoRotate, clearTimer])

  const handleScrollBeginDrag = useCallback(() => {
    isUserDragging.current = true
    clearTimer()
  }, [clearTimer])

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Ignorar se foi scroll programático (auto-rotate)
      if (!isUserDragging.current) return
      isUserDragging.current = false

      const newIndex = Math.round(e.nativeEvent.contentOffset.x / width)

      // Reposicionar se saiu do set do meio
      if (newIndex < itemCount || newIndex >= itemCount * 2) {
        const realIndex = ((newIndex % itemCount) + itemCount) % itemCount
        const resetTo = itemCount + realIndex
        flatListRef.current?.scrollToOffset({
          offset: resetTo * width,
          animated: false,
        })
        indexRef.current = resetTo
      } else {
        indexRef.current = newIndex
      }

      setActiveIndex(((newIndex % itemCount) + itemCount) % itemCount)

      // Retoma auto-rotate após 5s
      clearTimer()
      timerRef.current = setTimeout(() => {
        startAutoRotate()
      }, RESUME_DELAY)
    },
    [width, itemCount, startAutoRotate, clearTimer],
  )

  const renderItem = useCallback(
    ({ item }: { item: HeroBannerItem }) => (
      <HeroBannerSlide
        item={item}
        width={width}
        bannerHeight={bannerHeight}
        onPress={() => onPressItem(item.id, item.type)}
      />
    ),
    [width, bannerHeight, onPressItem],
  )

  if (itemCount === 0) return null

  return (
    <View className="mb-6">
      <FlatList
        ref={flatListRef}
        data={loopedItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => `hero-${item.id}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        initialScrollIndex={startIndex}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        windowSize={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews
      />
      {itemCount > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          {items.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 8 : 6,
                height: i === activeIndex ? 8 : 6,
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                opacity: i === activeIndex ? 1 : 0.4,
              }}
            />
          ))}
        </View>
      )}
    </View>
  )
}
