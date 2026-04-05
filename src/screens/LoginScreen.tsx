import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../types'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginForm) {
    setApiError(null)
    setIsLoading(true)
    const result = await signIn(data.email, data.password)
    setIsLoading(false)

    if (!result.success) {
      setApiError(result.error ?? 'Erro ao fazer login')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-accent">WavePlay</Text>
          <Text className="mt-2 text-text-secondary">
            Filmes e séries na palma da mão
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="Digite seu email"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={value}
              onChangeText={(text) => {
                onChange(text)
                if (apiError) setApiError(null)
              }}
              onBlur={onBlur}
              secureTextEntry={!showPassword}
              rightIcon={
                <Text className="text-sm text-accent">
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
            />
          )}
        />

        {apiError && (
          <Text className="mb-3 text-center text-sm text-error">{apiError}</Text>
        )}

        <View className="mt-4">
          <Button
            title="Entrar"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        </View>

        <Text
          className="mt-4 text-center text-sm text-accent"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Esqueci minha senha
        </Text>

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-text-secondary">Não tem conta? </Text>
          <Text
            className="font-semibold text-accent"
            onPress={() => navigation.navigate('Register')}
          >
            Criar conta
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
