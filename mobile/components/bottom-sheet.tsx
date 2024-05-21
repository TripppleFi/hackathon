import { forwardRef, useMemo } from "react"
import { View } from "react-native"
import {
  default as Animated,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated"
import {
  default as BottomSheetCustom,
  BottomSheetModal as BottomSheetModalCustom,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  type BottomSheetModalProps as BottomSheetModalPropsCustom,
  type BottomSheetProps as BottomSheetPropsCustom,
} from "@gorhom/bottom-sheet"

type BottomSheetProps = BottomSheetPropsCustom & { className?: string }
type BottomSheetModalProps = BottomSheetModalPropsCustom & {
  className?: string
  // enableDismissFromLastSnapPoint?: boolean
}

const BottomSheet = forwardRef<
  React.ElementRef<typeof BottomSheetCustom>,
  BottomSheetProps
>((props, ref) => {
  return <BottomSheetCustom {...props} ref={ref} backdropComponent={Backdrop} />
})

const BottomSheetModal = forwardRef<
  React.ElementRef<typeof BottomSheetModalCustom>,
  BottomSheetModalProps
>((props, ref) => {
  const { index = 1, snapPoints = ["25%", "75%"] } = props
  return (
    <BottomSheetModalCustom
      {...props}
      ref={ref}
      backgroundComponent={Background}
      backdropComponent={Backdrop}
      handleComponent={Handle}
      snapPoints={snapPoints}
      index={index}
    />
  )
})

function Backdrop({ animatedIndex, style }: BottomSheetBackdropProps) {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1],
      [0, 0.7],
      Extrapolation.CLAMP,
    ),
  }))

  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  )

  return <Animated.View className="bg-foreground" style={containerStyle} />
}

function Background(props: BottomSheetBackgroundProps) {
  return <View className="bg-background rounded-t-3xl" {...props} />
}

function Handle() {
  return (
    <View className="bg-foreground mt-4 h-1.5 w-10 self-center rounded-full" />
  )
}

export { BottomSheet, BottomSheetModal }
export {
  BottomSheetView,
  BottomSheetFlatList,
  BottomSheetSectionList,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet"
export { type BottomSheetModalMethods } from "@gorhom/bottom-sheet/src/types"
