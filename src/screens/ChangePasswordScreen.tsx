import React, { useState } from 'react'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BackButton } from '../components'
import { Button, Input } from '../components/ui'
import { auth } from '../services/auth'
import { useAuth } from '../hooks/useAuth'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Pelo menos 1 letra maiúscula')
      .regex(/[a-z]/, 'Pelo menos 1 letra minúscula')
      .regex(/\d/, 'Pelo menos 1 número'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function ChangePasswordScreen() {
  const insets = useSafeAreaInsets()
  const { signOut } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: ChangePasswordForm) {
    setApiError(null)
    setIsLoading(true)

    const response = await auth.changePassword(
      data.currentPassword,
      data.newPassword,
    )

    setIsLoading(false)

    if (response.success) {
      Alert.alert(
        'Senha alterada',
        'Você será desconectado e precisará entrar novamente com a nova senha.',
        [{ text: 'OK', onPress: () => signOut() }],
      )
    } else {
      setApiError(
        (response.error?.[0]?.message ?? 'Erro ao alterar senha').slice(0, 200),
      )
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="px-4 pt-4">
        <BackButton variant="inline" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="pb-2 pt-4 text-xl font-bold text-white">
          Alterar senha
        </Text>
        <Text className="mb-6 text-sm text-text-secondary">
          Após alterar a senha, você será desconectado e precisará entrar
          novamente. Outros dispositivos também serão desconectados.
        </Text>

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Senha atual"
              placeholder="Digite a senha atual"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              rightIcon={
                <Text className="text-sm text-accent">
                  {showCurrent ? 'Ocultar' : 'Mostrar'}
                </Text>
              }
              onRightIconPress={() => setShowCurrent(!showCurrent)}
              error={errors.currentPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Nova senha"
              placeholder="Mín 8 chars, com maiúscula, minúscula e número"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              secureTextEntry={!showNew}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              rightIcon={
                <Text className="text-sm text-accent">
                  {showNew ? 'Ocultar' : 'Mostrar'}
                </Text>
              }
              onRightIconPress={() => setShowNew(!showNew)}
              error={errors.newPassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirmar nova senha"
              placeholder="Repita a nova senha"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              rightIcon={
                <Text className="text-sm text-accent">
                  {showConfirm ? 'Ocultar' : 'Mostrar'}
                </Text>
              }
              onRightIconPress={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {apiError && (
          <Text className="mb-3 text-center text-sm text-error">
            {apiError}
          </Text>
        )}

        <View className="mt-2">
          <Button
            title="Alterar senha"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
