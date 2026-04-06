import React, { useState } from 'react'
import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Season } from '../types'

interface SeasonPickerProps {
  seasons: Season[]
  selectedSeason: number
  onSelect: (seasonNumber: number) => void
}

export function SeasonPicker({
  seasons,
  selectedSeason,
  onSelect,
}: SeasonPickerProps) {
  const [open, setOpen] = useState(false)
  const filtered = seasons.filter((s) => s.seasonNumber > 0)
  const selectedLabel = `Temporada ${selectedSeason}`

  if (filtered.length === 0) return null

  return (
    <View className="mb-4 px-4">
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center self-start rounded-chip bg-background-tertiary px-4 py-2.5"
      >
        <Text className="mr-2 text-sm font-medium text-white">
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={() => setOpen(false)}
        >
          <View className="max-h-80 w-64 overflow-hidden rounded-2xl bg-background-secondary">
            <Text className="px-4 pb-2 pt-4 text-base font-bold text-white">
              Selecionar Temporada
            </Text>
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item.seasonNumber)
                    setOpen(false)
                  }}
                  className={`px-4 py-3 ${
                    selectedSeason === item.seasonNumber ? 'bg-accent/20' : ''
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selectedSeason === item.seasonNumber
                        ? 'font-bold text-accent'
                        : 'text-text-secondary'
                    }`}
                  >
                    Temporada {item.seasonNumber}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}
