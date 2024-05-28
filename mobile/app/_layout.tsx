import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native"
import { QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"

import { BottomSheetModalProvider } from "@/components/bottom-sheet"
import { focusManagement, onlineManagement, qc } from "@/lib/query"

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router"

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(main)",
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SansLight: require("../assets/fonts/ClashGrotesk-Light.otf"),
    SansRegular: require("../assets/fonts/ClashGrotesk-Regular.otf"),
    SansMedium: require("../assets/fonts/ClashGrotesk-Medium.otf"),
    SansBold: require("../assets/fonts/ClashGrotesk-Semibold.otf"),
    SansBlack: require("../assets/fonts/ClashGrotesk-Bold.otf"),
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  // react query
  useEffect(onlineManagement, [])
  useEffect(focusManagement, [])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={getThemeOverride()}>
      <GestureHandlerRootView className="bg-background flex-1">
        <QueryClientProvider client={qc}>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}

function getThemeOverride() {
  return {
    colors: {
      ...DefaultTheme.colors,
      background: "transparent",
    },
  } as Theme
}
