import React from 'react'
import { FlatList } from 'react-native'
import { Chip } from './ui/Chip'
import type { Genre } from '../types'

interface GenreChipsProps {
  genres: Genre[]
  selectedGenreId: number | null
  onSelect: (genreId: number | null) => void
}

export function GenreChips({
  genres,
  selectedGenreId,
  onSelect,
}: GenreChipsProps) {
  return (
    <FlatList
      data={[{ id: 0, name: 'Todos' }, ...genres]}
      renderItem={({ item }) => (
        <Chip
          label={item.name}
          isActive={
            item.id === 0
              ? selectedGenreId === null
              : selectedGenreId === item.id
          }
          onPress={() => onSelect(item.id === 0 ? null : item.id)}
        />
      )}
      keyExtractor={(item) => String(item.id)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
      style={{ height: 48, flexGrow: 0, marginBottom: 12 }}
    />
  )
}
