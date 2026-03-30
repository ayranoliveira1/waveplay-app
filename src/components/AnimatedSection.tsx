import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

interface AnimatedSectionProps {
  delay?: number
  children: React.ReactNode
}

export function AnimatedSection({ delay = 0, children }: AnimatedSectionProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(18)).current

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start()
    }, delay)

    return () => clearTimeout(timeout)
  }, [delay, opacity, translateY])

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  )
}
