import { api } from './api'
import type { Plan } from '../types'

export async function getPlans(): Promise<Plan[]> {
  const response = await api.get<{ plans: Plan[] }>('/plans')
  if (!response.success) {
    throw new Error(response.error?.[0]?.message ?? 'Erro ao carregar planos')
  }
  return response.data.plans
}
