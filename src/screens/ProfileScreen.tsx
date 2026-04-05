import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, Pressable, Alert, Modal, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { AnimatedSection, Carousel, MediaCard, ContinueWatchingCard, ScreenHeader } from '../components'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import { EmptyState } from '../components/ui'
import { BottomSheetMenu } from '../components/ui/BottomSheetMenu'
import type { BottomSheetMenuItem } from '../components/ui/BottomSheetMenu'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth, useFavorites, useWatchlist, useHistory, useProfile } from '../hooks'
import type { RootStackParamList, MediaItem, HistoryItem, Profile } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface ProfileSwitcherSheetProps {
  visible: boolean
  onClose: () => void
  profiles: Profile[]
  activeProfileId?: string
  maxProfiles: number
  onSelect: (id: string) => void
  onAdd: () => void
}

function ProfileSwitcherSheet({
  visible,
  onClose,
  profiles,
  activeProfileId,
  maxProfiles,
  onSelect,
  onAdd,
}: ProfileSwitcherSheetProps) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(300)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      slideAnim.setValue(300)
      fadeAnim.setValue(0)
    }
  }, [visible, slideAnim, fadeAnim])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose())
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim }}
        className="bg-black/60"
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
        }}
        className="rounded-t-2xl bg-background-secondary"
      >
        <View className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-text-muted" />
        </View>

        <Text className="mb-4 text-center text-base font-semibold text-white">
          Quem está assistindo?
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 20 }}
        >
          {profiles.map((profile, index) => {
            const isActive = profile.id === activeProfileId
            const color = PROFILE_COLORS[index % PROFILE_COLORS.length]
            return (
              <Pressable
                key={profile.id}
                onPress={() => onSelect(profile.id)}
                className="items-center"
                style={{ width: 72 }}
              >
                <View
                  className="h-16 w-16 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: color,
                    borderWidth: isActive ? 2 : 0,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <Text className="text-xl font-bold text-white">
                    {getInitials(profile.name)}
                  </Text>
                </View>
                <Text
                  className={`mt-2 text-center text-xs ${isActive ? 'font-bold text-white' : 'text-text-secondary'}`}
                  numberOfLines={1}
                >
                  {profile.name}
                </Text>
                {profile.isKid && (
                  <Text className="text-[10px] text-accent">Infantil</Text>
                )}
              </Pressable>
            )
          })}

          {profiles.length < maxProfiles && (
            <Pressable
              onPress={onAdd}
              className="items-center"
              style={{ width: 72 }}
            >
              <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-text-muted">
                <Ionicons name="add" size={28} color="#5A5A72" />
              </View>
              <Text className="mt-2 text-center text-xs text-text-secondary">
                Adicionar
              </Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={{ height: insets.bottom + 16 }} />
      </Animated.View>
    </Modal>
  )
}

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { signOut } = useAuth()
  const { activeProfile, profiles, maxProfiles, selectProfile } = useProfile()
  const queryClient = useQueryClient()
  const { favorites } = useFavorites()
  const { watchlist } = useWatchlist()
  const { history, reload: reloadHistory } = useHistory()

  const continueWatching = history.filter(
    (h) =>
      h.progressSeconds &&
      h.durationSeconds &&
      h.progressSeconds / h.durationSeconds < 0.9,
  )

  const [menuVisible, setMenuVisible] = useState(false)
  const [profileSheetVisible, setProfileSheetVisible] = useState(false)

  useFocusEffect(
    useCallback(() => {
      reloadHistory()
      queryClient.refetchQueries({ queryKey: ['favorites', activeProfile?.id] })
      queryClient.refetchQueries({ queryKey: ['watchlist', activeProfile?.id] })
    }, [reloadHistory, queryClient, activeProfile?.id]),
  )

  const profileIndex = profiles.findIndex((p) => p.id === activeProfile?.id)
  const profileColor =
    PROFILE_COLORS[(profileIndex >= 0 ? profileIndex : 0) % PROFILE_COLORS.length]

  function handleMediaPress(id: number, type: 'movie' | 'series') {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { id })
    } else {
      navigation.navigate('SeriesDetail', { id })
    }
  }

  function handleSignOut() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ])
  }

  const menuItems: BottomSheetMenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Minha Conta',
      onPress: () => navigation.navigate('Account'),
    },
    {
      icon: 'settings-outline',
      label: 'Configurações',
      onPress: () => {},
    },
    {
      icon: 'swap-horizontal-outline',
      label: 'Trocar Perfil',
      onPress: () => navigation.navigate('ProfileSelection'),
    },
    ...(activeProfile
      ? [
          {
            icon: 'pencil-outline' as const,
            label: 'Gerenciar Perfil',
            onPress: () =>
              navigation.navigate('ProfileForm', {
                profileId: activeProfile.id,
              }),
          },
        ]
      : []),
    {
      icon: 'log-out-outline',
      label: 'Sair',
      onPress: handleSignOut,
      danger: true,
    },
  ]

  const hasContent = history.length > 0 || favorites.length > 0 || watchlist.length > 0

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title="Perfil"
        rightAction={
          <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color="#A0A0B8" />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeProfile && (
          <Pressable
            onPress={() => setProfileSheetVisible(true)}
            className="items-center px-4 py-4"
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: profileColor }}
            >
              <Text className="text-xl font-bold text-white">
                {getInitials(activeProfile.name)}
              </Text>
            </View>
            <View className="mt-2 flex-row items-center">
              <Text className="text-base font-semibold text-white">
                {activeProfile.name}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color="#A0A0B8"
                style={{ marginLeft: 4 }}
              />
            </View>
            {activeProfile.isKid && (
              <Text className="mt-0.5 text-xs font-medium text-accent">
                Infantil
              </Text>
            )}
          </Pressable>
        )}

        {continueWatching.length > 0 && (
          <AnimatedSection delay={0}>
            <Carousel
              title="Continuar Assistindo"
              data={continueWatching.slice(0, 10)}
              keyExtractor={(item: HistoryItem) => `history-${item.id}-${item.type}`}
              renderItem={(item: HistoryItem) => (
                <ContinueWatchingCard item={item} onPress={handleMediaPress} />
              )}
            />
          </AnimatedSection>
        )}

        {favorites.length > 0 && (
          <AnimatedSection delay={100}>
            <Carousel
              title="Favoritos"
              data={favorites.slice(0, 15)}
              keyExtractor={(item: MediaItem) => `fav-${item.id}-${item.type}`}
              renderItem={(item: MediaItem) => (
                <MediaCard
                  id={item.id}
                  title={item.title}
                  posterPath={item.posterPath}
                  rating={item.rating}
                  type={item.type}
                  onPress={handleMediaPress}
                />
              )}
            />
          </AnimatedSection>
        )}

        {watchlist.length > 0 && (
          <AnimatedSection delay={200}>
            <Carousel
              title="Assistir Depois"
              data={watchlist.slice(0, 15)}
              keyExtractor={(item: MediaItem) => `wl-${item.id}-${item.type}`}
              renderItem={(item: MediaItem) => (
                <MediaCard
                  id={item.id}
                  title={item.title}
                  posterPath={item.posterPath}
                  rating={item.rating}
                  type={item.type}
                  onPress={handleMediaPress}
                />
              )}
            />
          </AnimatedSection>
        )}

        {!hasContent && (
          <EmptyState
            title="Nada por aqui ainda"
            message="Seus favoritos, watchlist e histórico aparecerão aqui"
          />
        )}

        <View className="h-8" />
      </ScrollView>

      <BottomSheetMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
      />

      <ProfileSwitcherSheet
        visible={profileSheetVisible}
        onClose={() => setProfileSheetVisible(false)}
        profiles={profiles}
        activeProfileId={activeProfile?.id}
        maxProfiles={maxProfiles}
        onSelect={(id) => {
          selectProfile(id)
          setProfileSheetVisible(false)
          navigation.navigate('Main', { screen: 'Home' } as never)
        }}
        onAdd={() => {
          setProfileSheetVisible(false)
          setTimeout(() => navigation.navigate('ProfileForm', {}), 250)
        }}
      />
    </View>
  )
}
