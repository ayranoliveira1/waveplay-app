import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../services/api'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../types'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>
}

export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordForm) {
    setIsLoading(true)
    await api.post('/auth/forgot-password', { email: data.email }).catch(() => {})
    setIsLoading(false)
    setIsSent(true)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-white">
            Recuperar senha
          </Text>
          <Text className="mt-2 text-center text-text-secondary">
            Digite seu email para receber o link de recuperação
          </Text>
        </View>

        {isSent ? (
          <View className="items-center">
            <Text className="mb-8 text-center text-base text-text-secondary">
              Se o email estiver cadastrado, enviaremos um link de recuperação.
            </Text>
            <Button
              title="Voltar para o Login"
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Digite seu email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email?.message}
                />
              )}
            />

            <View className="mt-4">
              <Button
                title="Enviar"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
              />
            </View>

            <Text
              className="mt-4 text-center text-sm text-accent"
              onPress={() => navigation.goBack()}
            >
              Voltar para o Login
            </Text>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
