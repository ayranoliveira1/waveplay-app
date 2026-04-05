import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const subscription = user?.subscription ?? null

  const isExpired =
    subscription !== null &&
    subscription.endsAt !== null &&
    new Date(subscription.endsAt) < new Date()

  const canWatch = subscription !== null && !isExpired

  return { subscription, isExpired, canWatch }
}
