import React from "react"
import { TouchableOpacity, View } from "react-native"
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { Redirect, Tabs } from "expo-router"

import { Text } from "@/components/text"
import { SavingsContextProvider } from "@/hooks/use-savings"
import { useAccount } from "@/hooks/use-sui"
import { cn } from "@/lib/utils"

export default function TabLayout() {
  const { account } = useAccount()
  if (!account) {
    return <Redirect href="/login" />
  }

  return (
    <SavingsContextProvider>
      <Tabs
        backBehavior="initialRoute"
        initialRouteName="index"
        screenOptions={{ headerShown: false }}
        tabBar={state => <CustomTabBar {...state} />}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="cards" options={{ title: "Cards" }} />
        <Tabs.Screen name="savings" options={{ title: "Savings" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </SavingsContextProvider>
  )
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="px-4 pb-4 pt-0">
      <View className="bg-background border-foreground/30 flex-row rounded-full border px-1 py-1">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              // @ts-ignore
              navigation.navigate({ name: route.name, merge: true })
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            })
          }

          const tabClasses = cn(
            "flex-1 py-1.5",
            isFocused && "bg-foreground rounded-full",
          )

          const textClasses = cn(
            "text-center",
            isFocused && "font-uiBold text-background",
          )

          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              className={tabClasses}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              key={route.key}
            >
              <Text className={textClasses}>{label as string}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
