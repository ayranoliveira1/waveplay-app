export const colors = {
  background: {
    primary: '#0A0A0F',
    secondary: '#14141F',
    tertiary: '#1E1E2E',
  },
  accent: {
    default: '#7B2FBE',
    light: '#9B4FDE',
    dark: '#5A1F8E',
    glow: 'rgba(123, 47, 190, 0.2)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B8',
    muted: '#5A5A72',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    rating: '#FFD700',
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const borderRadius = {
  card: 12,
  button: 8,
  chip: 20,
  poster: 8,
} as const

export const fontSize = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  hero: 28,
} as const

export const PROFILE_COLORS = [
  '#7B2FBE',
  '#E91E63',
  '#2196F3',
  '#4CAF50',
  '#FF9800',
] as const

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
