import { SectionList, View } from "react-native"
import { type SuiTransactionBlockResponse } from "@mysten/sui.js/client"
import { Skeleton } from "moti/skeleton"
import * as r from "radash"

import { Currency } from "@/components/currency"
import { Icon } from "@/components/icon"
import { Label, Subheading, Text } from "@/components/text"
import { Container } from "@/components/view"
import { useSuiClientQueries } from "@/hooks/use-sui"
import { chunk } from "@/lib/array"
import { date } from "@/lib/date"
import { activityParser } from "@/lib/parsers"
import { cn, idFactory, shortenAddress } from "@/lib/utils"

interface TransactionProps {
  address?: string
  label: string
}

export function Transaction({ address, label }: TransactionProps) {
  const { data, isPending } = useTransactions(address)

  return (
    <Container className="bg-background border-foreground/30 mt-8 flex-1 border-t">
      <Subheading className="pt-4">{label}</Subheading>
      {isPending && <TransactionSkeleton />}
      {!isPending &&
        (data.length === 0 ? (
          <View className="border-b-muted-foreground flex-1 items-center justify-center border-b">
            <View className="items-center gap-3">
              <Icon
                name="Clock10"
                variant="secondary"
                className="text-muted-foreground text-3xl"
              />
              <Text className="text-muted-foreground">
                No {label.toLocaleLowerCase()} yet
              </Text>
            </View>
          </View>
        ) : (
          <SectionList
            sections={data}
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
                    variant="secondary"
                    size={24}
                  />
                </View>
                <View className="flex-1">
                  <Text> {shortenAddress(item?.account ?? "")}</Text>
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
        ))}
    </Container>
  )
}

export function useTransactions(address?: string) {
  return useSuiClientQueries({
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
      isSuccess: res.every(res => res.isSuccess),
      isPending: res.some(res => res.isPending),
      isError: res.some(res => res.isError),
      refetch: () => Promise.all(res.map(res => res.refetch())),
      data: parseTransactionBlocks(
        res.flatMap(res => res.data?.data ?? []),
        String(address),
      ),
    }),
  })
}

const key = idFactory("TransactionSkeleton")
function TransactionSkeleton() {
  const data = [...new Array(5).keys()]
  return (
    <Skeleton.Group show>
      <View className="pb-2.5 pt-4">
        <Skeleton width={100} height={16} />
      </View>
      <View>
        {data.map(() => (
          <View
            key={key.next()}
            className="flex-row items-center gap-x-4 py-2.5"
          >
            <View className="bg-secondary rounded-full">
              <Skeleton width={36} height={36} radius="round" />
            </View>
            <View className="flex-1">
              <Skeleton width={150} height={16} />
              <View className="py-px" />
              <Skeleton width={100} height={16} />
            </View>
            <View>
              <Skeleton width={52} />
            </View>
          </View>
        ))}
      </View>
    </Skeleton.Group>
  )
}

function parseTransactionBlocks(
  blocks: SuiTransactionBlockResponse[],
  address: string,
) {
  const parsed = r.chain(
    (piped: SuiTransactionBlockResponse[]) => r.unique(piped, i => i.digest),
    piped => piped.filter(pipe => pipe.effects?.status.status === "success"),
    piped => r.sort(piped, sub => Number(sub.timestampMs), true),
    piped =>
      chunk(piped, sub =>
        date(Number(sub.timestampMs)).startOf("date").format("MMM D, YYYY"),
      ),
  )(blocks)

  return r
    .listify(parsed, (key, data) => ({
      key,
      data: data.map(value => validateResponse(value, address)),
    }))
    .filter(({ data }) => data.filter(Boolean).length > 0)
}

function validateResponse(block: SuiTransactionBlockResponse, address: string) {
  const result = activityParser.safeParse(block)
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
