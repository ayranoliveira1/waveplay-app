import React, { useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { AuthNavigator } from './AuthNavigator'
import { MainNavigator } from './MainNavigator'
import { SplashScreen, MovieDetailScreen, SeriesDetailScreen, PlayerScreen, FavoritesScreen, HistoryScreen } from '../screens'
import { useAuth } from '../hooks'
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
  const [showSplash, setShowSplash] = useState(true)

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

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
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
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
          <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
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
  )
}
