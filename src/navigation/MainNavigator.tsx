import React from 'react'
import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import {
  HomeScreen,
  MoviesScreen,
  SeriesScreen,
  ProfileScreen,
} from '../screens'
import { useProfile } from '../hooks'
import { PROFILE_COLORS, getInitials } from '../constants/theme'
import type { MainTabParamList } from '../types'

function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { activeProfile, profiles } = useProfile()

  if (!activeProfile) {
    return (
      <Ionicons
        name={focused ? 'person-circle' : 'person-circle-outline'}
        size={24}
        color={focused ? '#7B2FBE' : '#5A5A72'}
      />
    )
  }

  const index = profiles.findIndex((p) => p.id === activeProfile.id)
  const color = PROFILE_COLORS[(index >= 0 ? index : 0) % PROFILE_COLORS.length]

  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: focused ? 2 : 0,
        borderColor: '#7B2FBE',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
        {getInitials(activeProfile.name)}
      </Text>
    </View>
  )
}

const Tab = createBottomTabNavigator<MainTabParamList>()

const tabIcons: Record<
  keyof MainTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Movies: { active: 'film', inactive: 'film-outline' },
  Series: { active: 'tv', inactive: 'tv-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
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
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}
