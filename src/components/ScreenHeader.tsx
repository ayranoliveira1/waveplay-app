import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface ScreenHeaderProps {
  title: string
  rightAction?: React.ReactNode
}

export function ScreenHeader({ title, rightAction }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()

  return (
    <View
      className="flex-row items-center justify-between bg-background px-4 pb-2"
      style={{ paddingTop: insets.top + 8 }}
    >
      <Text className="text-xl font-bold text-white">{title}</Text>
      <View className="flex-row items-center gap-3">
        {rightAction}
        <Pressable
          onPress={() => navigation.navigate('Search')}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color="#A0A0B8" />
        </Pressable>
      </View>
    </View>
  )
}
