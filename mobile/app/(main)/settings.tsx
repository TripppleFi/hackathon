import { View } from "react-native"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import { useSui } from "@/hooks/use-sui"
import { qc } from "@/lib/query"

export default function SettingsScreen() {
  const { requestAirdrop } = useSui()

  async function handleAirdropRequest() {
    try {
      await requestAirdrop()
      await qc.invalidateQueries()
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
