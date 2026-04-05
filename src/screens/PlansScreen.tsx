import React from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { BackButton } from '../components'
import { getPlans } from '../services/plans'
import { useAuth } from '../hooks'
import type { Plan } from '../types'

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Grátis'
  const reais = Math.floor(priceCents / 100)
  const centavos = String(priceCents % 100).padStart(2, '0')
  return `R$ ${reais},${centavos}`
}

function PlanCard({
  plan,
  isCurrent,
}: {
  plan: Plan
  isCurrent: boolean
}) {
  return (
    <View
      className={`rounded-card p-4 ${isCurrent ? 'border border-primary bg-primary/10' : 'bg-background-secondary'}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-white">{plan.name}</Text>
        {isCurrent && (
          <View className="rounded-full bg-primary/20 px-3 py-1">
            <Text className="text-xs font-semibold text-primary">
              Seu plano
            </Text>
          </View>
        )}
      </View>

      <Text className="mt-1 text-2xl font-bold text-white">
        {formatPrice(plan.priceCents)}
        {plan.priceCents > 0 && (
          <Text className="text-sm font-normal text-text-secondary">
            /mês
          </Text>
        )}
      </Text>

      <Text className="mt-2 text-sm text-text-secondary">
        {plan.description}
      </Text>

      <View className="mt-4 gap-2">
        <View className="flex-row items-center">
          <Ionicons
            name="people-outline"
            size={16}
            color="#A0A0B8"
            style={{ marginRight: 8 }}
          />
          <Text className="text-sm text-text-secondary">
            Até {plan.maxProfiles} perfil{plan.maxProfiles > 1 ? 's' : ''}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons
            name="tv-outline"
            size={16}
            color="#A0A0B8"
            style={{ marginRight: 8 }}
          />
          <Text className="text-sm text-text-secondary">
            {plan.maxStreams} tela{plan.maxStreams > 1 ? 's' : ''} simultânea
            {plan.maxStreams > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {!isCurrent && (
        <View className="mt-4 items-center rounded-button bg-background-tertiary py-3 opacity-50">
          <Text className="text-sm font-medium text-text-muted">Em breve</Text>
        </View>
      )}
    </View>
  )
}

export function PlansScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const currentSlug = user?.subscription?.plan.slug ?? ''

  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    )
  }

  if (isError || !plans) {
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
            Erro ao carregar planos
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 32 }}
    >
      <View className="px-4 pt-4">
        <BackButton variant="inline" />
      </View>

      <Text className="px-4 pb-1 pt-4 text-xl font-bold text-white">
        Planos
      </Text>
      <Text className="px-4 pb-4 text-sm text-text-secondary">
        Escolha o plano ideal para você
      </Text>

      <View className="gap-3 px-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.slug === currentSlug}
          />
        ))}
      </View>
    </ScrollView>
  )
}
