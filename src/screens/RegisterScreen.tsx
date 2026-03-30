import React, { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Input } from '../components/ui'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../types'

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      Alert.alert(
        'Em breve!',
        'O cadastro estará disponível em breve. Use as credenciais de teste para acessar.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
    }, 1000)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-accent">Criar Conta</Text>
          <Text className="mt-2 text-text-secondary">
            Junte-se ao WavePlay
          </Text>
        </View>

        <Input
          label="Nome"
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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
          secureTextEntry
        />

        <Input
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View className="mt-4">
          <Button
            title="Criar Conta"
            onPress={handleRegister}
            isLoading={isLoading}
          />
        </View>

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-text-secondary">Já tem conta? </Text>
          <Text
            className="font-semibold text-accent"
            onPress={() => navigation.goBack()}
          >
            Entrar
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
