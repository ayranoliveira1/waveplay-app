import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

interface SplashScreenProps {
  onFinish: () => void
}

const LETTERS = 'WAVEPLAY'.split('')
const LETTER_DELAY = 250
const HOLD_DURATION = 2000

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const letterAnims = useRef(LETTERS.map(() => new Animated.Value(0))).current
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const animations = letterAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    )

    Animated.stagger(LETTER_DELAY, animations).start(() => {
      setTimeout(() => {
        onFinishRef.current()
      }, HOLD_DURATION)
    })
  }, [letterAnims])

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <StatusBar style="light" />
      <View style={{ flexDirection: 'row' }}>
        {LETTERS.map((letter, i) => (
          <Animated.Text
            key={i}
            style={{
              fontSize: 52,
              fontWeight: '800',
              color: '#7B2FBE',
              letterSpacing: 2,
              opacity: letterAnims[i],
              transform: [
                {
                  translateY: letterAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            }}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  )
}
