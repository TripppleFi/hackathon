import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
// import { useTransactions } from "@/components/transactions"
import { useLogin, useSui /* useSuiClientQuery */ } from "@/hooks/use-sui"

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { logout } = useLogin()
  const { /*  account, */ requestAirdrop } = useSui()
  // const balance = useSuiClientQuery("getBalance", { owner: account.address })
  // const transactions = useTransactions(account.address)

  async function handleAirdropRequest() {
    try {
      await requestAirdrop()
      // await Promise.all([balance.refetch(), transactions.refetch()])
    } catch (error) {
      console.log("error:", error)
    }
  }

  function handleLogout() {
    logout()
    router.replace("/")
  }

  return (
    <View
      className="flex-1 items-end justify-end gap-8 p-8"
      style={{ paddingTop: insets.top }}
    >
      <View className="gap-y-8">
        <Button variant="outline" onPress={handleLogout}>
          <Text>Logout</Text>
        </Button>
        <Button variant="outline" onPress={handleAirdropRequest}>
          <Text>Request airdrop</Text>
        </Button>
      </View>
    </View>
  )
}
