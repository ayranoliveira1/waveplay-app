import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NavigationProp } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../types'

interface SubscriptionBannerProps {
  isExpired: boolean
}

export function SubscriptionBanner({ isExpired }: SubscriptionBannerProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <Pressable
      onPress={() => navigation.navigate('Plans')}
      className="absolute bottom-16 left-6 right-6 z-10 items-center rounded-card bg-black/70 px-5 py-4"
    >
      <View className="items-center gap-2">
        <Ionicons name="lock-closed" size={24} color="#7B2FBE" />
        <Text className="text-center text-sm font-semibold text-white">
          {isExpired
            ? 'Sua assinatura expirou.\nRenove para continuar assistindo'
            : 'Assine um plano para assistir'}
        </Text>
      </View>
    </Pressable>
  )
}
