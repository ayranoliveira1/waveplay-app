import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, Modal, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export interface BottomSheetMenuItem {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  danger?: boolean
}

interface BottomSheetMenuProps {
  visible: boolean
  onClose: () => void
  items: BottomSheetMenuItem[]
}

export function BottomSheetMenu({
  visible,
  onClose,
  items,
}: BottomSheetMenuProps) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(300)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      slideAnim.setValue(300)
      fadeAnim.setValue(0)
    }
  }, [visible, slideAnim, fadeAnim])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose())
  }

  function handleItemPress(onPress: () => void) {
    handleClose()
    setTimeout(onPress, 250)
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim }}
        className="bg-black/60"
      >
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
        }}
        className="rounded-t-2xl bg-background-secondary"
      >
        <View className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-text-muted" />
        </View>

        <View className="px-4 pb-2">
          {items.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleItemPress(item.onPress)}
              className="flex-row items-center rounded-card px-4 py-4"
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? '#F44336' : '#A0A0B8'}
                style={{ marginRight: 12 }}
              />
              <Text
                className={`text-base font-medium ${item.danger ? 'text-error' : 'text-white'}`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: insets.bottom + 8 }} />
      </Animated.View>
    </Modal>
  )
}
