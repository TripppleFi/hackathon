import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import {
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native"
import { QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"

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
  const insets = useSafeAreaInsets()
  const [loaded, error] = useFonts({
    Geist100: require("../assets/fonts/Geist-Thin.ttf"),
    Geist200: require("../assets/fonts/Geist-UltraLight.ttf"),
    Geist300: require("../assets/fonts/Geist-Light.ttf"),
    Geist400: require("../assets/fonts/Geist-Regular.ttf"),
    Geist500: require("../assets/fonts/Geist-Medium.ttf"),
    Geist600: require("../assets/fonts/Geist-SemiBold.ttf"),
    Geist700: require("../assets/fonts/Geist-Bold.ttf"),
    Geist800: require("../assets/fonts/Geist-Black.ttf"),
    Geist900: require("../assets/fonts/Geist-UltraBlack.ttf"),
    ...FontAwesome.font,
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
      <GestureHandlerRootView
        className="flex-1"
        style={{ paddingTop: insets.top }}
      >
        <QueryClientProvider client={qc}>
          <Stack screenOptions={{ headerShown: false }} />
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
