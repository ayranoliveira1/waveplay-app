import './src/global.css'

import React from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SystemUI from 'expo-system-ui'

import { AuthProvider } from './src/contexts/AuthContext'
import { ProfileProvider } from './src/contexts/ProfileContext'
import { AppNavigator } from './src/navigation'

SystemUI.setBackgroundColorAsync('#0A0A0F')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
          <AuthProvider>
            <ProfileProvider>
              <AppNavigator />
            </ProfileProvider>
          </AuthProvider>
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
