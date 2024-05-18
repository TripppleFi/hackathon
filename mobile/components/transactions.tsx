import { useMemo } from "react"
import { SectionList, View } from "react-native"
import { type SuiTransactionBlockResponse } from "@mysten/sui.js/client"
import * as r from "radash"

import { Currency } from "@/components/currency"
import { Icon } from "@/components/icon"
import { Label, Subheading, Text } from "@/components/text"
import { Container } from "@/components/view"
import { useSuiClientQueries } from "@/hooks/use-sui"
import { chunk } from "@/lib/array"
import { date } from "@/lib/date"
import { activityParser } from "@/lib/parsers"
import { cn, shortenAddress } from "@/lib/utils"

interface TransactionProps {
  address?: string
  label: string
}

export function Transaction({ address, label }: TransactionProps) {
  const { data } = useSuiClientQueries({
    queries: [
      {
        method: "queryTransactionBlocks",
        params: { filter: { FromAddress: String(address) } },
        enabled: !!address,
      },
      {
        method: "queryTransactionBlocks",
        params: { filter: { ToAddress: String(address) } },
        enabled: !!address,
      },
    ],
    combine: res => ({
      data: r.unique(
        res.flatMap(res => res.data?.data ?? []),
        i => i.digest,
      ),
      isSuccess: res.every(res => res.isSuccess),
      isPending: res.some(res => res.isPending),
      isError: res.some(res => res.isError),
    }),
  })

  const validateResponse = (response: SuiTransactionBlockResponse) => {
    const result = activityParser.safeParse(response)
    if (result.error) return null

    const meIndex = result.data.balanceChanges.findIndex(
      change => change.owner.AddressOwner === address,
    )

    if (meIndex === -1) return null

    const meChange = result.data.balanceChanges[meIndex]
    const sender = meChange.amount < 0
    const otherIndex = result.data.balanceChanges.findIndex(change => {
      return sender ? change.owner.AddressOwner !== address : change.amount < 0
    })

    if (otherIndex === -1) return null

    return {
      sender,
      digest: result.data.digest,
      action: sender ? "send" : "receive",
      amount: result.data.balanceChanges[meIndex].amount,
      account: result.data.balanceChanges[otherIndex].owner.AddressOwner,
      createdAt: date(Number(result.data.timestampMs)).fromNow(),
    }
  }

  const activity = useMemo(() => {
    return r
      .chain(
        (piped: SuiTransactionBlockResponse[]) =>
          r.sort(piped, sub => Number(sub.timestampMs), true),
        piped =>
          chunk(piped, sub =>
            date(Number(sub.timestampMs)).startOf("date").format("MMM D, YYYY"),
          ),
        piped =>
          r.listify(piped, (key, data) => ({
            key,
            data: data?.map(validateResponse),
          })),
      )(data)
      .filter(({ data }) => data.filter(Boolean).length > 0)
  }, [data])

  return (
    <Container className="bg-background border-primary/50 mt-8 flex-1 border-t">
      <Subheading className="pt-4">{label}</Subheading>
      <SectionList
        sections={activity}
        keyExtractor={item => String(item?.digest)}
        renderSectionHeader={({ section }) => (
          <Label className="pb-2.5 pt-4">{section.key}</Label>
        )}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-x-4 py-2.5">
            <View className="bg-secondary rounded-full p-2">
              <Icon
                name={
                  item?.action === "send" ? "ArrowUpRight" : "ArrowDownLeft"
                }
                variant="outline"
                size={24}
              />
            </View>
            <View className="flex-1">
              <Text>{shortenAddress(item?.account ?? "")}</Text>
              <Text className="text-muted-foreground text-xs">
                {item?.createdAt}
              </Text>
            </View>
            <View>
              <Currency
                className={cn("font-uiMedium text-lg")}
                amount={(item?.amount ?? 0) / 1e9}
              />
            </View>
          </View>
        )}
      />
    </Container>
  )
}
