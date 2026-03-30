import React, { useState } from 'react'
import { View, TextInput, Text, Pressable } from 'react-native'
import type { TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconPress?: () => void
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-medium text-text-secondary">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-card bg-background-tertiary px-4 ${
          isFocused ? 'border border-accent' : 'border border-transparent'
        } ${error ? 'border-error' : ''}`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 py-3.5 text-base text-white"
          placeholderTextColor="#5A5A72"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} className="ml-3">
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="mt-1 text-xs text-error">{error}</Text>
      )}
    </View>
  )
}
