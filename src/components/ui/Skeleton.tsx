import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

interface SkeletonProps {
  width: number | string
  height: number | string
  borderRadius?: number
}

export function Skeleton({
  width,
  height,
  borderRadius = 8,
}: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [shimmer])

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <View
      style={{
        width: width as number,
        height: height as number,
        borderRadius,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1E1E2E',
          borderRadius,
          opacity,
        }}
      />
    </View>
  )
}
