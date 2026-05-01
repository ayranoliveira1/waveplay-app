import React, { useRef, useState } from 'react'
import { View, Text, Pressable, Modal, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { Genre } from '../types'

interface GenrePickerProps {
  genres: Genre[]
  selectedGenreId: number | null
  onSelect: (genreId: number | null) => void
}

const ALL_GENRE_ID = 0
const BUTTON_WIDTH = 160

export function GenrePicker({
  genres,
  selectedGenreId,
  onSelect,
}: GenrePickerProps) {
  const buttonRef = useRef<View>(null)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState({ x: 0, y: 0, height: 0 })

  const items: Genre[] = [{ id: ALL_GENRE_ID, name: 'Todos' }, ...genres]
  const selectedName =
    selectedGenreId === null
      ? 'Todos'
      : (genres.find((g) => g.id === selectedGenreId)?.name ?? 'Todos')

  function openMenu() {
    buttonRef.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ x, y, height })
      setOpen(true)
    })
  }

  return (
    <View className="px-4 pb-3">
      <Pressable
        ref={buttonRef}
        onPress={openMenu}
        style={{ width: BUTTON_WIDTH }}
        className="flex-row items-center justify-between rounded-chip bg-background-tertiary px-4 py-2.5"
      >
        <Text className="text-sm font-medium text-white" numberOfLines={1}>
          {selectedName}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: anchor.y + anchor.height + 4,
              left: anchor.x,
              width: BUTTON_WIDTH,
            }}
            className="max-h-96 overflow-hidden rounded-2xl bg-background-secondary"
          >
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isActive =
                  item.id === ALL_GENRE_ID
                    ? selectedGenreId === null
                    : selectedGenreId === item.id
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.id === ALL_GENRE_ID ? null : item.id)
                      setOpen(false)
                    }}
                    className={`px-4 py-3 ${isActive ? 'bg-accent/20' : ''}`}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-sm ${
                        isActive
                          ? 'font-bold text-accent'
                          : 'text-text-secondary'
                      }`}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}
