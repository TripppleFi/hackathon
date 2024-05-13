import { View } from "react-native"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import { useBalance } from "@/hooks/use-queries"
import { useSui } from "@/hooks/use-sui"

export default function SettingsScreen() {
  const { requestAirdrop } = useSui()
  const balance = useBalance()

  async function handleAirdropRequest() {
    try {
      await requestAirdrop()
      await balance.refetch()
    } catch (error) {
      console.log("error:", error)
    }
  }

  return (
    <View className="flex-1 items-end justify-end p-8">
      <Button onPress={handleAirdropRequest}>
        <Text>Request airdrop</Text>
      </Button>
    </View>
  )
}
