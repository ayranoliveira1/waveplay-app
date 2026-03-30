import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../hooks'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../types'

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }

    setIsLoading(true)
    const success = await signIn(email, password)
    setIsLoading(false)

    if (!success) {
      Alert.alert('Erro', 'Email ou senha incorretos')
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

        <Input
          label="Email"
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={
            <Text className="text-sm text-accent">
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Text>
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        <View className="mt-4">
          <Button
            title="Entrar"
            onPress={handleSignIn}
            isLoading={isLoading}
          />
        </View>

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
