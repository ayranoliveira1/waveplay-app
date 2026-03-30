import React, { useRef } from 'react'
import { Animated, Pressable, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  isLoading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

const variantStyles = {
  primary: 'bg-accent',
  secondary: 'bg-background-secondary',
  ghost: 'bg-transparent',
  outline: 'bg-transparent border border-accent',
} as const

const textStyles = {
  primary: 'text-white',
  secondary: 'text-text-secondary',
  ghost: 'text-accent',
  outline: 'text-accent',
} as const

export function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || isLoading}
        className={`flex-row items-center justify-center rounded-button px-6 py-3.5 ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon}
            <Text
              className={`text-base font-semibold ${textStyles[variant]} ${icon ? 'ml-2' : ''}`}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}
