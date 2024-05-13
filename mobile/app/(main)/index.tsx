import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/button"
import { Currency } from "@/components/currency"
import { Icon } from "@/components/icon"
import { Label, Subheading, Text } from "@/components/text"
import { useBalance } from "@/hooks/use-queries"

import { CardTransactions } from "./cards"

export default function IndexScreen() {
  const balance = useBalance()
  const insets = useSafeAreaInsets()
  const amount = Number(balance.data?.totalBalance ?? 0)
  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-8">
        <View className="items-center justify-center pb-12 pt-36">
          <Subheading className="mb-3">Total Balance</Subheading>
          <Currency amount={amount / 1e9} className="font-uiBold text-5xl" />
        </View>
      </View>

      <View className="px-8">
        <Label className="mb-1">Wallet Actions</Label>
        <View className="flex-row justify-between gap-4">
          <Button variant="default" className="flex-1">
            <Icon name="MoveDownLeft" variant="default" />
            <Text>Deposit</Text>
          </Button>
          <Button variant="outline" className="flex-1">
            <Icon name="MoveUpRight" variant="outline" />
            <Text>Send</Text>
          </Button>
        </View>
      </View>
      <CardTransactions />
    </View>
  )
}
