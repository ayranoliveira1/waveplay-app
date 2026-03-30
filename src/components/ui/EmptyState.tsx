import React from 'react'
import { View, Text } from 'react-native'

interface EmptyStateProps {
  title: string
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="mb-2 text-center text-lg font-semibold text-white">
        {title}
      </Text>
      {message && (
        <Text className="text-center text-sm text-text-secondary">
          {message}
        </Text>
      )}
    </View>
  )
}
