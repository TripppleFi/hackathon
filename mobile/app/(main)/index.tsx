import { ScrollView, SectionList, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSuiClientQuery } from "@mysten/dapp-kit"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/button"
import { Currency } from "@/components/currency"
import { Icon } from "@/components/icon"
import { Label, Subheading, Text } from "@/components/text"
import { Container } from "@/components/view"
import { useBalance } from "@/hooks/use-queries"
import { useSui } from "@/hooks/use-sui"
import { idFactory } from "@/lib/utils"

const id = idFactory("Home")
export default function IndexScreen() {
  const balance = useBalance()
  const insets = useSafeAreaInsets()
  const amount = Number(balance.data?.totalBalance ?? 0)

  return (
    <View className="bg-muted flex-1" style={{ paddingTop: insets.top }}>
      <Container>
        <View className="items-center justify-center pb-12 pt-36">
          <Subheading className="mb-3">Total Balance</Subheading>
          <Currency amount={amount / 1e9} className="font-uiBold text-5xl" />
        </View>
      </Container>
      <Container>
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
      </Container>
      <Activity />
    </View>
  )
}

function Activity() {
  const { account, suiClient } = useSui()
  const activity = useQuery({
    queryKey: ["activity"],
    queryFn() {
      return suiClient.queryTransactionBlocks({
        filter: { FromOrToAddress: { addr: account.address } },
      })
    },
  })

  const DATA = [
    {
      title: "Main dishes",
      data: ["Pizza", "Burger", "Risotto"],
    },
    {
      title: "Sides",
      data: ["French Fries", "Onion Rings", "Fried Shrimps"],
    },
    {
      title: "Drinks",
      data: ["Water", "Coke", "Beer"],
    },
    {
      title: "Desserts",
      data: ["Cheese Cake", "Ice Cream"],
    },
  ]

  return (
    <Container className="bg-background border-primary/50 mt-8 flex-1 border-t">
      <Subheading className="pt-4">Activity</Subheading>
      <ScrollView>
        <Text>{JSON.stringify(activity, null, 2)}</Text>
      </ScrollView>
      {/* <SectionList
        sections={DATA}
        keyExtractor={() => id.next("txSection")}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => <Label>{section.title}</Label>}
        renderItem={() => (
          <View className="flex-row items-center gap-x-4 py-1">
            <View className="bg-secondary rounded-full p-2">
              <Icon name="ArrowDownLeft" variant="outline" size={24} />
            </View>
            <View className="flex-1">
              <Text>lorem ipsum</Text>
              <Text className="text-muted-foreground text-xs">04:03 PM</Text>
            </View>
            <View>
              <Currency amount={-20} />
            </View>
          </View>
        )}
      /> */}
    </Container>
  )
}
