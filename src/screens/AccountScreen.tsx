import React from 'react'
import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { BackButton } from '../components'
import { api } from '../services/api'
import type { UserData } from '../types'

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  return (
    <View className="flex-row items-center rounded-card bg-background-secondary px-4 py-3">
      <Ionicons
        name={icon}
        size={18}
        color="#A0A0B8"
        style={{ marginRight: 12 }}
      />
      <View className="flex-1">
        <Text className="text-xs text-text-muted">{label}</Text>
        <Text className="mt-0.5 text-sm font-medium text-white">{value}</Text>
      </View>
    </View>
  )
}

export function AccountScreen() {
  const insets = useSafeAreaInsets()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const response = await api.get<{ user: UserData }>('/account')
      if (!response.success) {
        throw new Error(response.error?.[0]?.message ?? 'Erro ao carregar conta')
      }
      return response.data.user
    },
  })

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4">
          <BackButton variant="inline" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="alert-circle-outline" size={48} color="#5A5A72" />
          <Text className="mt-3 text-center text-base text-text-secondary">
            Erro ao carregar dados da conta
          </Text>
        </View>
      </View>
    )
  }

  const subscription = data.subscription

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}
    >
      <View className="px-4 pt-4">
        <BackButton variant="inline" />
      </View>

      <Text className="px-4 pb-2 pt-4 text-xl font-bold text-white">
        Conta
      </Text>

      <View className="gap-2 px-4 pt-2">
        <Text className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Dados pessoais
        </Text>
        <InfoCard icon="person-outline" label="Nome" value={data.name} />
        <InfoCard icon="mail-outline" label="Email" value={data.email} />
        <InfoCard
          icon="calendar-outline"
          label="Conta criada em"
          value={formatDate(data.createdAt)}
        />
      </View>

      <View className="mt-6 gap-2 px-4">
        <Text className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Assinatura
        </Text>
        {subscription ? (
          <>
            <InfoCard
              icon="diamond-outline"
              label="Plano"
              value={subscription.plan.name}
            />
            <InfoCard
              icon="checkmark-circle-outline"
              label="Status"
              value={subscription.status === 'active' ? 'Ativa' : subscription.status}
            />
            <InfoCard
              icon="play-outline"
              label="Início"
              value={formatDate(subscription.startedAt)}
            />
            <InfoCard
              icon="time-outline"
              label="Expira em"
              value={subscription.endsAt ? formatDate(subscription.endsAt) : 'Indefinido'}
            />
            <InfoCard
              icon="people-outline"
              label="Perfis"
              value={`Até ${subscription.plan.maxProfiles} perfil(is)`}
            />
            <InfoCard
              icon="tv-outline"
              label="Telas simultâneas"
              value={`Até ${subscription.plan.maxStreams}`}
            />
          </>
        ) : (
          <View className="items-center rounded-card bg-background-secondary px-4 py-6">
            <Ionicons name="diamond-outline" size={32} color="#5A5A72" />
            <Text className="mt-2 text-center text-sm text-text-secondary">
              Nenhuma assinatura ativa
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
