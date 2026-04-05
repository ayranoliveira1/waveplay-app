import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile } from '../hooks'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../types'

const profileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  isKid: z.boolean(),
})

type ProfileForm = z.infer<typeof profileSchema>

interface ProfileFormScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileForm'>
  route: RouteProp<RootStackParamList, 'ProfileForm'>
}

export function ProfileFormScreen({
  navigation,
  route,
}: ProfileFormScreenProps) {
  const insets = useSafeAreaInsets()
  const { profileId } = route.params ?? {}
  const isEditing = !!profileId

  const {
    profiles,
    maxProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useProfile()

  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const existingProfile = isEditing
    ? profiles.find((p) => p.id === profileId)
    : null

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: existingProfile?.name ?? '',
      isKid: existingProfile?.isKid ?? false,
    },
  })

  useEffect(() => {
    if (existingProfile) {
      reset({
        name: existingProfile.name,
        isKid: existingProfile.isKid,
      })
    }
  }, [existingProfile, reset])

  async function onSubmit(data: ProfileForm) {
    setApiError(null)
    setIsLoading(true)

    const result = isEditing
      ? await updateProfile(profileId!, data)
      : await createProfile(data)

    setIsLoading(false)

    if (result.success) {
      navigation.goBack()
    } else {
      setApiError(result.error ?? 'Erro ao salvar perfil')
    }
  }

  function handleDelete() {
    if (!profileId) return

    Alert.alert(
      'Excluir perfil',
      'Tem certeza? Todos os dados deste perfil (favoritos, histórico, progresso) serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            const result = await deleteProfile(profileId)
            setIsLoading(false)

            if (result.success) {
              navigation.goBack()
            } else {
              setApiError(result.error ?? 'Erro ao excluir perfil')
            }
          },
        },
      ],
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-white">
            {isEditing ? 'Editar perfil' : 'Novo perfil'}
          </Text>
          <Text className="mt-2 text-sm text-text-secondary">
            {profiles.length}/{maxProfiles} perfis
          </Text>
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nome do perfil"
              placeholder="Ex: João, Maria..."
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              autoCapitalize="words"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="isKid"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4 flex-row items-center justify-between rounded-card bg-background-tertiary px-4 py-3">
              <View>
                <Text className="text-base font-medium text-white">
                  Perfil infantil
                </Text>
                <Text className="text-xs text-text-secondary">
                  Conteúdo filtrado para crianças
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: '#2A2A3E', true: '#7B2FBE' }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}
        />

        {apiError && (
          <Text className="mb-3 text-center text-sm text-error">
            {apiError}
          </Text>
        )}

        <View className="mt-4">
          <Button
            title={isEditing ? 'Salvar' : 'Criar perfil'}
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </View>

        {isEditing && (
          <View className="mt-3">
            <Button
              title="Excluir perfil"
              onPress={handleDelete}
              variant="ghost"
              disabled={isLoading}
            />
          </View>
        )}

        <Text
          className="mt-4 text-center text-sm text-accent"
          onPress={() => navigation.goBack()}
        >
          Voltar
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}
