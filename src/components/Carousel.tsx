import React from 'react'
import { View, Text, FlatList } from 'react-native'

interface CarouselProps<T> {
  title: string
  data: T[]
  renderItem: (item: T) => React.ReactElement
  keyExtractor: (item: T) => string
}

export const Carousel = React.memo(function Carousel<T>({
  title,
  data,
  renderItem,
  keyExtractor,
}: CarouselProps<T>) {
  return (
    <View className="mb-6">
      <Text className="mb-3 px-4 text-lg font-bold text-white">{title}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        windowSize={3}
        maxToRenderPerBatch={5}
        removeClippedSubviews
      />
    </View>
  )
}) as <T>(props: CarouselProps<T>) => React.ReactElement
