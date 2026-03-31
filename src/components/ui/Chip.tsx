import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface ChipProps {
  label: string
  isActive?: boolean
  onPress: () => void
  onRemove?: () => void
}

export function Chip({ label, isActive = false, onPress, onRemove }: ChipProps) {
  return (
    <View
      className={`mr-2 flex-row items-center rounded-chip ${
        isActive
          ? 'bg-accent'
          : 'border border-accent bg-transparent'
      }`}
    >
      <Pressable onPress={onPress} className="py-2 pl-4 pr-2">
        <Text
          className={`text-sm font-medium ${
            isActive ? 'text-white' : 'text-accent'
          }`}
        >
          {label}
        </Text>
      </Pressable>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="py-2 pr-3"
        >
          <Text
            className={`text-xs ${isActive ? 'text-white/70' : 'text-accent/70'}`}
          >
            ✕
          </Text>
        </Pressable>
      )}
      {!onRemove && <View className="pr-2" />}
    </View>
  )
}
