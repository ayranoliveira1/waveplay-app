import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import {
  HomeScreen,
  MoviesScreen,
  SeriesScreen,
  SearchScreen,
  SettingsScreen,
} from '../screens'
import type { MainTabParamList } from '../types'

const Tab = createBottomTabNavigator<MainTabParamList>()

const tabIcons: Record<
  keyof MainTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Movies: { active: 'film', inactive: 'film-outline' },
  Series: { active: 'tv', inactive: 'tv-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#14141F',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#7B2FBE',
        tabBarInactiveTintColor: '#5A5A72',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name]
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          )
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Movies" component={MoviesScreen} options={{ title: 'Filmes' }} />
      <Tab.Screen name="Series" component={SeriesScreen} options={{ title: 'Séries' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Busca' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  )
}
