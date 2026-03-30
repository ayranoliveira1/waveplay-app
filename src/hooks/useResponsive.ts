import { useWindowDimensions } from 'react-native'

export function useResponsive() {
  const { width, height } = useWindowDimensions()
  const isTablet = width >= 768

  return {
    width,
    height,
    isTablet,
    numColumns: isTablet ? 3 : 2,
    cardWidth: isTablet ? width / 3 - 24 : (width - 48) / 2,
  }
}
