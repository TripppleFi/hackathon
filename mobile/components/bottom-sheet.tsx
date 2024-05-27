import { forwardRef, useMemo, type PropsWithChildren } from "react"
import { Dimensions, View } from "react-native"
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

import { Loader } from "@/components/loader"

type BottomSheetProps = BottomSheetPropsCustom & { className?: string }
type BottomSheetModalProps = PropsWithChildren<
  Omit<BottomSheetModalPropsCustom, "children"> & {
    className?: string
    // enableDismissFromLastSnapPoint?: boolean
  }
>

const BottomSheet = forwardRef<
  React.ElementRef<typeof BottomSheetCustom>,
  BottomSheetProps
>((props, ref) => {
  return <BottomSheetCustom {...props} ref={ref} backdropComponent={Backdrop} />
})

const BottomSheetModal = forwardRef<
  React.ElementRef<typeof BottomSheetModalCustom>,
  BottomSheetModalProps & { isLoading?: boolean }
>(({ isLoading, ...props }, ref) => {
  const dimensions = Dimensions.get("window")
  const { index = 1, snapPoints = ["25%", dimensions.height / 2] } = props
  return (
    <BottomSheetModalCustom
      {...props}
      ref={ref}
      backgroundComponent={Background}
      backdropComponent={Backdrop}
      enablePanDownToClose={!isLoading}
      enableHandlePanningGesture={!isLoading}
      enableContentPanningGesture={!isLoading}
      handleComponent={Handle}
      snapPoints={snapPoints}
      index={index}
    >
      {props.children}
      {isLoading && (
        <View className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-neutral-950/70">
          <View>
            <Loader size="lg" />
          </View>
        </View>
      )}
    </BottomSheetModalCustom>
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
