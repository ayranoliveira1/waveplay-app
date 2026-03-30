import React from 'react'
import { View, Text } from 'react-native'

interface BadgeProps {
  value: string | number
  variant?: 'rating' | 'status' | 'info'
}

export function Badge({ value, variant = 'info' }: BadgeProps) {
  const bgColor = {
    rating: 'bg-rating/20',
    status: 'bg-success/20',
    info: 'bg-accent/20',
  }[variant]

  const textColor = {
    rating: 'text-rating',
    status: 'text-success',
    info: 'text-accent-light',
  }[variant]

  return (
    <View className={`flex-row items-center rounded-full px-2 py-0.5 ${bgColor}`}>
      {variant === 'rating' && (
        <Text className="mr-1 text-xs text-rating">★</Text>
      )}
      <Text className={`text-xs font-bold ${textColor}`}>{value}</Text>
    </View>
  )
}
