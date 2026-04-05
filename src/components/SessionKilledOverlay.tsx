import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

interface SessionKilledOverlayProps {
  onGoBack: () => void
}

export function SessionKilledOverlay({ onGoBack }: SessionKilledOverlayProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="absolute inset-0 z-50 items-center justify-center bg-black/90 px-8"
    >
      <View className="items-center">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-error/20">
          <Ionicons name="tv-outline" size={40} color="#F44336" />
        </View>

        <Text className="text-center text-xl font-bold text-white">
          Sessão encerrada
        </Text>

        <Text className="mt-3 text-center text-sm leading-5 text-text-secondary">
          Alguém iniciou uma reprodução em outro dispositivo e sua sessão foi
          encerrada.
        </Text>
      </View>

      <Pressable
        onPress={onGoBack}
        className="mt-8 w-full items-center rounded-button bg-primary py-3.5"
      >
        <Text className="text-base font-semibold text-white">Voltar</Text>
      </Pressable>
    </View>
  )
}
