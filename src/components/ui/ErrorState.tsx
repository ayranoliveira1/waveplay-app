import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = 'Não foi possível carregar os dados',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name="cloud-offline-outline" size={48} color="#5A5A72" />
      <Text className="mb-2 mt-4 text-center text-lg font-semibold text-white">
        Algo deu errado
      </Text>
      <Text className="text-center text-sm text-text-secondary">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-4 rounded-button bg-accent px-6 py-2.5"
        >
          <Text className="text-sm font-semibold text-white">Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  )
}
