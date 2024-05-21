import { useEffect } from "react"
import {
  default as Animated,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import { Icon } from "./icon"

interface LoaderProps {
  size?: "default" | "lg"
}

export function Loader({ size = "default" }: LoaderProps) {
  const newSize = size === "default" ? 24 : 48
  const rotate = useSharedValue("0deg")
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: rotate.value }],
  }))

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming("360deg", { duration: 1000 }),
      -1,
      true,
    )
  }, [])

  return (
    <Animated.View style={animatedStyles}>
      <Icon size={newSize} variant="secondary" name="LoaderCircle" />
    </Animated.View>
  )
}
