import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as Updates from 'expo-updates'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { SplashScreen, MovieDetailScreen, SeriesDetailScreen, PlayerScreen, SearchScreen, ProfileSelectionScreen, ProfileFormScreen, AccountScreen, PlansScreen } from '../screens'
import { UpdateModal } from '../components/ui'
import { useAuth, useProfile } from '../hooks'
import type { RootStackParamList } from '../types'

const Stack = createNativeStackNavigator<RootStackParamList>()

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <StatusBar style="light" />
      <ActivityIndicator size="large" color="#7B2FBE" />
    </View>
  )
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth()
  const { activeProfile, isLoading: profileLoading } = useProfile()
  const insets = useSafeAreaInsets()
  const [showSplash, setShowSplash] = useState(true)

  // OTA update — roda desde o início, em paralelo com tudo
  const [checkingUpdate, setCheckingUpdate] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const didCheckUpdate = useRef(false)
  const { isDownloading, downloadProgress } = Updates.useUpdates()

  useEffect(() => {
    if (didCheckUpdate.current) return
    didCheckUpdate.current = true

    ;(async () => {
      try {
        if (Updates.isEnabled) {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 10000),
          )
          const check = await Promise.race([
            Updates.checkForUpdateAsync(),
            timeout,
          ])
          if (check.isAvailable) {
            setCheckingUpdate(false)
            setShowUpdateModal(true)
            return
          }
        }
      } catch {
        // em dev, sem rede ou timeout, ignora
      }
      setCheckingUpdate(false)
    })()
  }, [])

  const handleUpdate = useCallback(async () => {
    try {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    } catch {
      setShowUpdateModal(false)
    }
  }, [])

  const handleSkipUpdate = useCallback(() => {
    setShowUpdateModal(false)
  }, [])

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: '#7B2FBE',
        background: '#0A0A0F',
        card: '#0A0A0F',
        text: '#FFFFFF',
        border: '#14141F',
        notification: '#7B2FBE',
      },
    }),
    [],
  )

  return (
    <View style={{ flex: 1 }}>
      {checkingUpdate && (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            right: 16,
            zIndex: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(20,20,31,0.9)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 6,
          }}
        >
          <ActivityIndicator size="small" color="#7B2FBE" />
          <Text style={{ color: '#7B2FBE', fontSize: 12 }}>
            Verificando atualização...
          </Text>
        </View>
      )}

      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : isLoading || (isAuthenticated && profileLoading) ? (
        <LoadingScreen />
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          {isAuthenticated ? (
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0A0A0F' },
                animation: 'slide_from_right',
              }}
            >
              {!activeProfile ? (
                <>
                  <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
                  <Stack.Screen name="ProfileForm" component={ProfileFormScreen} />
                  <Stack.Screen name="Main" component={MainNavigator} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Main" component={MainNavigator} />
                  <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
                  <Stack.Screen name="ProfileForm" component={ProfileFormScreen} />
                </>
              )}
              <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
              <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="Account" component={AccountScreen} />
              <Stack.Screen name="Plans" component={PlansScreen} />
              <Stack.Screen
                name="Player"
                component={PlayerScreen}
                options={{ orientation: 'all' }}
              />
            </Stack.Navigator>
          ) : (
            <AuthNavigator />
          )}
        </NavigationContainer>
      )}

      <UpdateModal
        visible={showUpdateModal}
        downloading={isDownloading}
        progress={downloadProgress ?? 0}
        onUpdate={handleUpdate}
        onSkip={handleSkipUpdate}
      />
    </View>
  )
}
