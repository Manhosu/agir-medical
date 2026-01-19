import { useEffect } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated'

// Fade In Animation
export const useFadeIn = (delay: number = 0, duration: number = 500) => {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return animatedStyle
}

// Fade In Up Animation
export const useFadeInUp = (delay: number = 0, duration: number = 500, distance: number = 20) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(distance)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return animatedStyle
}

// Fade In Left Animation
export const useFadeInLeft = (delay: number = 0, duration: number = 500, distance: number = 20) => {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(-distance)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    translateX.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }))

  return animatedStyle
}

// Fade In Right Animation
export const useFadeInRight = (delay: number = 0, duration: number = 500, distance: number = 20) => {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(distance)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    translateX.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }))

  return animatedStyle
}

// Scale In Animation
export const useScaleIn = (delay: number = 0, duration: number = 400) => {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 150 }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return animatedStyle
}

// Pulse Glow Animation (for primary elements)
export const usePulseGlow = () => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.8)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    )
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.8, { duration: 1500 })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return animatedStyle
}

// Stagger Animation Hook - returns array of animated styles
export const useStaggeredFadeIn = (count: number, baseDelay: number = 0, staggerDelay: number = 100) => {
  const items = Array.from({ length: count }, (_, index) => {
    const delay = baseDelay + index * staggerDelay
    return useFadeInUp(delay, 400, 15)
  })
  return items
}

// Button Press Animation
export const useButtonAnimation = () => {
  const scale = useSharedValue(1)

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 })
  }

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return { animatedStyle, onPressIn, onPressOut }
}

// Card Hover/Press Animation
export const useCardAnimation = () => {
  const scale = useSharedValue(1)
  const shadowOpacity = useSharedValue(0.1)

  const onPressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 })
    shadowOpacity.value = withTiming(0.2, { duration: 150 })
  }

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    shadowOpacity.value = withTiming(0.1, { duration: 150 })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return { animatedStyle, onPressIn, onPressOut }
}

// Progress Bar Animation
export const useProgressAnimation = (targetProgress: number, duration: number = 1000) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(300, withTiming(targetProgress, { duration, easing: Easing.out(Easing.cubic) }))
  }, [targetProgress])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }))

  return animatedStyle
}

// Floating Animation (for decorative elements)
export const useFloatingAnimation = (amplitude: number = 10, duration: number = 3000) => {
  const translateY = useSharedValue(0)

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return animatedStyle
}

// Shake Animation (for errors)
export const useShakeAnimation = () => {
  const translateX = useSharedValue(0)

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    )
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return { animatedStyle, shake }
}
