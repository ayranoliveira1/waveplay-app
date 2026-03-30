import React from 'react'
import { Pressable, Text } from 'react-native'

interface ChipProps {
  label: string
  isActive?: boolean
  onPress: () => void
}

export function Chip({ label, isActive = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-chip px-4 py-2 ${
        isActive
          ? 'bg-accent'
          : 'border border-accent bg-transparent'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isActive ? 'text-white' : 'text-accent'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
