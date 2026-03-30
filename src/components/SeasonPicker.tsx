import React from 'react'
import { ScrollView, Pressable, Text } from 'react-native'
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
  const filteredSeasons = seasons.filter((s) => s.seasonNumber > 0)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="mb-4"
    >
      {filteredSeasons.map((season) => (
        <Pressable
          key={season.id}
          onPress={() => onSelect(season.seasonNumber)}
          className={`rounded-chip px-4 py-2 ${
            selectedSeason === season.seasonNumber
              ? 'bg-accent'
              : 'bg-background-tertiary'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              selectedSeason === season.seasonNumber
                ? 'text-white'
                : 'text-text-secondary'
            }`}
          >
            Temporada {season.seasonNumber}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}
