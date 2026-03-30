import React, { useState } from 'react'
import { View, Text, Pressable, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useAuth } from '../hooks'
import type { RootStackParamList } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-card bg-background-secondary px-4 py-4"
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? '#F44336' : '#A0A0B8'}
        style={{ marginRight: 12 }}
      />
      <Text
        className={`flex-1 text-base font-medium ${danger ? 'text-error' : 'text-white'}`}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color="#5A5A72" />
    </Pressable>
  )
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp>()
  const { user, signOut } = useAuth()
  const [showAbout, setShowAbout] = useState(false)

  const appVersion = Constants.expoConfig?.version ?? '1.0.0'
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  function handleSignOut() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Text className="px-4 pb-2 pt-4 text-xl font-bold text-white">
        Ajustes
      </Text>

      <View className="items-center px-4 py-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Text className="text-2xl font-bold text-white">{initials}</Text>
        </View>
        <Text className="mt-3 text-lg font-semibold text-white">
          {user?.name ?? 'Usuário'}
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          {user?.email ?? ''}
        </Text>
      </View>

      <View className="gap-2 px-4">
        <MenuItem
          icon="heart"
          label="Favoritos"
          onPress={() => navigation.navigate('Favorites')}
        />

        <MenuItem
          icon="time-outline"
          label="Histórico"
          onPress={() => navigation.navigate('History')}
        />

        <Pressable
          onPress={() => setShowAbout(!showAbout)}
          className="flex-row items-center rounded-card bg-background-secondary px-4 py-4"
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#A0A0B8"
            style={{ marginRight: 12 }}
          />
          <Text className="flex-1 text-base font-medium text-white">
            Sobre o app
          </Text>
          <Ionicons
            name={showAbout ? 'chevron-up' : 'chevron-forward'}
            size={16}
            color="#5A5A72"
          />
        </Pressable>

        {showAbout && (
          <View className="rounded-card bg-background-tertiary px-4 py-3">
            <Text className="text-sm font-semibold text-white">WavePlay</Text>
            <Text className="mt-1 text-xs text-text-secondary">
              Versão {appVersion}
            </Text>
            <Text className="mt-1 text-xs text-text-muted">
              App de streaming de filmes e séries
            </Text>
          </View>
        )}

        <MenuItem
          icon="log-out-outline"
          label="Sair"
          onPress={handleSignOut}
          danger
        />
      </View>
    </View>
  )
}
