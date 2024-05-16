import { View } from "react-native"
import { useRouter } from "expo-router"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import { useLogin, useSui } from "@/hooks/use-sui"
import { qc } from "@/lib/query"

export default function SettingsScreen() {
  const router = useRouter()
  const { logout } = useLogin()
  const { requestAirdrop } = useSui()

  async function handleAirdropRequest() {
    try {
      await requestAirdrop()
      await qc.invalidateQueries()
    } catch (error) {
      console.log("error:", error)
    }
  }

  function handleLogout() {
    logout()
    router.replace("/")
  }

  return (
    <View className="flex-1 items-end justify-end gap-8 p-8">
      <View className="flex-row gap-x-8">
        <Button variant="outline" onPress={handleAirdropRequest}>
          <Text>Request airdrop</Text>
        </Button>
        <Button onPress={handleLogout}>
          <Text>Logout</Text>
        </Button>
      </View>
    </View>
  )
}
