import React from 'react'
import { Pressable, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

interface BackButtonProps {
  variant?: 'overlay' | 'inline'
  style?: object
}

export function BackButton({ variant = 'overlay', style }: BackButtonProps) {
  const navigation = useNavigation()

  const baseClass =
    variant === 'overlay'
      ? 'flex-row items-center justify-center rounded-full bg-black/50 px-3 py-2.5'
      : 'flex-row items-center py-2'

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      className={baseClass}
      style={style}
    >
      <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
      <Text className="ml-1 text-sm font-medium text-white">Voltar</Text>
    </Pressable>
  )
}
