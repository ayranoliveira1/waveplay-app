import React from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface UpdateModalProps {
  visible: boolean
  latestVersion: string
  releaseNotes: string | null
  forceUpdate: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdateModal({
  visible,
  latestVersion,
  releaseNotes,
  forceUpdate,
  onUpdate,
  onDismiss,
}: UpdateModalProps) {
  // Em forceUpdate, ignoramos onRequestClose (back fisico no Android).
  const handleRequestClose = () => {
    if (!forceUpdate) onDismiss()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full rounded-card bg-background-secondary p-6">
          <View className="items-center">
            <Ionicons
              name="cloud-download-outline"
              size={48}
              color="#7B2FBE"
            />
            <Text className="mt-4 text-center text-xl font-bold text-white">
              Nova versão disponível
            </Text>
            <Text className="mt-2 text-center text-sm text-text-secondary">
              {forceUpdate
                ? 'É necessário atualizar para continuar usando o WavePlay'
                : 'Sem atualizar, o app pode não funcionar como deveria'}
            </Text>
            <Text className="mt-3 text-center text-xs text-text-secondary">
              Versão {latestVersion} disponível
            </Text>
          </View>

          {releaseNotes && (
            <View className="mt-5 rounded-button bg-background-tertiary/40 p-3">
              <Text className="mb-1 text-xs font-semibold uppercase text-text-secondary">
                Novidades
              </Text>
              <ScrollView style={{ maxHeight: 150 }}>
                <Text className="text-sm text-white">{releaseNotes}</Text>
              </ScrollView>
            </View>
          )}

          <View className="mt-6 gap-3">
            <Pressable
              onPress={onUpdate}
              className="items-center rounded-button bg-accent py-3"
            >
              <Text className="text-base font-semibold text-white">
                Atualizar agora
              </Text>
            </Pressable>

            {!forceUpdate && (
              <Pressable
                onPress={onDismiss}
                className="items-center py-3"
              >
                <Text className="text-sm text-text-secondary">Depois</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}
