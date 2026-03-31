import React from 'react'
import { View, Text, Pressable, ActivityIndicator, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface UpdateModalProps {
  visible: boolean
  downloading: boolean
  progress: number
  onUpdate: () => void
  onSkip: () => void
}

export function UpdateModal({
  visible,
  downloading,
  progress,
  onUpdate,
  onSkip,
}: UpdateModalProps) {
  const percentage = Math.round(progress * 100)

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full rounded-card bg-background-secondary p-6">
          <View className="items-center">
            <Ionicons
              name="cloud-download-outline"
              size={48}
              color="#7B2FBE"
            />
            <Text className="mt-4 text-center text-xl font-bold text-white">
              Nova atualização disponível
            </Text>
            <Text className="mt-2 text-center text-sm text-text-secondary">
              Sem atualizar, o app pode não funcionar como deveria
            </Text>
          </View>

          {downloading && (
            <View className="mt-5">
              <View className="h-1.5 overflow-hidden rounded-full bg-background-tertiary">
                <View
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${percentage}%` }}
                />
              </View>
              <View className="mt-2 flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#7B2FBE" />
                <Text className="text-sm text-text-secondary">
                  Baixando... {percentage}%
                </Text>
              </View>
            </View>
          )}

          <View className="mt-6 gap-3">
            <Pressable
              onPress={onUpdate}
              disabled={downloading}
              className="items-center rounded-button bg-accent py-3"
              style={downloading ? { opacity: 0.6 } : undefined}
            >
              <Text className="text-base font-semibold text-white">
                {downloading ? 'Atualizando...' : 'Atualizar agora'}
              </Text>
            </Pressable>

            <Pressable
              onPress={onSkip}
              disabled={downloading}
              className="items-center py-3"
              style={downloading ? { opacity: 0.4 } : undefined}
            >
              <Text className="text-sm text-text-secondary">Agora não</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
