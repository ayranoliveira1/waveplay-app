import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { StreamConflictError, ActiveStreamInfo } from '../types'

interface StreamConflictModalProps {
  visible: boolean
  conflict: StreamConflictError | null
  onKillStream: (streamId: string) => Promise<void>
  onCancel: () => void
}

export function StreamConflictModal({
  visible,
  conflict,
  onKillStream,
  onCancel,
}: StreamConflictModalProps) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(400)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [killingId, setKillingId] = useState<string | null>(null)

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
      slideAnim.setValue(400)
      fadeAnim.setValue(0)
      setKillingId(null)
    }
  }, [visible, slideAnim, fadeAnim])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onCancel())
  }

  async function handleKill(streamId: string) {
    setKillingId(streamId)
    await onKillStream(streamId)
    setKillingId(null)
  }

  if (!conflict) return null

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim }}
        className="bg-black/70"
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

        <View className="px-5 pb-2">
          <Text className="text-center text-lg font-bold text-white">
            Limite de telas atingido
          </Text>
          <Text className="mt-1 text-center text-sm text-text-secondary">
            Seu plano permite {conflict.maxStreams} tela
            {conflict.maxStreams > 1 ? 's' : ''} simultânea
            {conflict.maxStreams > 1 ? 's' : ''}
          </Text>
        </View>

        <View className="mt-3 px-4">
          {conflict.activeStreams.map((stream: ActiveStreamInfo) => (
            <View
              key={stream.streamId}
              className="mb-2 flex-row items-center justify-between rounded-card bg-background-tertiary px-4 py-3"
            >
              <View className="flex-1 mr-3">
                <Text
                  className="text-sm font-semibold text-white"
                  numberOfLines={1}
                >
                  {stream.title}
                </Text>
                <Text className="mt-0.5 text-xs text-text-secondary">
                  {stream.profileName} •{' '}
                  {stream.type === 'movie' ? 'Filme' : 'Série'}
                </Text>
              </View>
              <Pressable
                onPress={() => handleKill(stream.streamId)}
                disabled={killingId !== null}
                className="rounded-button bg-error/20 px-3 py-2"
              >
                {killingId === stream.streamId ? (
                  <ActivityIndicator size="small" color="#F44336" />
                ) : (
                  <Text className="text-xs font-semibold text-error">
                    Encerrar
                  </Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        <View className="mt-2 px-4">
          <Pressable
            onPress={handleClose}
            className="items-center rounded-button py-3"
          >
            <Text className="text-sm font-medium text-text-secondary">
              Voltar
            </Text>
          </Pressable>
        </View>

        <View style={{ height: insets.bottom + 8 }} />
      </Animated.View>
    </Modal>
  )
}
