import React from 'react'
import { View, Text } from 'react-native'

interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'md'
}

export function RatingBadge({ rating, size = 'sm' }: RatingBadgeProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <View className="flex-row items-center rounded-full bg-black/60 px-2 py-0.5">
      <Text className={`mr-0.5 ${textSize} text-rating`}>★</Text>
      <Text className={`font-bold text-white ${textSize}`}>
        {rating.toFixed(1)}
      </Text>
    </View>
  )
}
