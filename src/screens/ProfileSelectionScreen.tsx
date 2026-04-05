import React from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useProfile } from '../hooks'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types'

interface ProfileSelectionScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSelection'>
}

export function ProfileSelectionScreen({
  navigation,
}: ProfileSelectionScreenProps) {
  const insets = useSafeAreaInsets()
  const { profiles, isLoading, maxProfiles, selectProfile } =
    useProfile()

  function handleSelect(profileId: string) {
    selectProfile(profileId)
    navigation.navigate('Main')
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-center text-2xl font-bold text-white">
          Quem está assistindo?
        </Text>
        <Text className="mb-8 text-center text-sm text-text-secondary">
          Selecione um perfil para continuar
        </Text>

        <View className="flex-row flex-wrap justify-center gap-6">
          {profiles.map((profile, index) => (
            <View key={profile.id} className="items-center">
              <Pressable
                onPress={() => handleSelect(profile.id)}
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    PROFILE_COLORS[index % PROFILE_COLORS.length],
                }}
              >
                <Text className="text-2xl font-bold text-white">
                  {getInitials(profile.name)}
                </Text>
              </Pressable>

              <Text className="mt-2 text-sm text-white">{profile.name}</Text>

              {profile.isKid && (
                <Text className="text-xs text-text-secondary">Infantil</Text>
              )}
            </View>
          ))}

          {profiles.length < maxProfiles && (
            <View className="items-center">
              <Pressable
                onPress={() => navigation.navigate('ProfileForm', {})}
                className="h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-text-muted"
              >
                <Ionicons name="add" size={32} color="#5A5A72" />
              </Pressable>
              <Text className="mt-2 text-sm text-text-secondary">
                Adicionar
              </Text>
            </View>
          )}
        </View>

        <Text className="mt-6 text-center text-xs text-text-muted">
          {profiles.length}/{maxProfiles} perfis
        </Text>
      </View>
    </View>
  )
}
