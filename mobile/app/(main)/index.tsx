import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { Dimensions, View, ViewProps } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Clipboard from "expo-clipboard"
import { z } from "zod"

import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetModalMethods,
} from "@/components/bottom-sheet"
import { Button } from "@/components/button"
import { Currency } from "@/components/currency"
import { Icon } from "@/components/icon"
import { Input } from "@/components/input"
import { Label, Subheading, Text } from "@/components/text"
import { Transaction } from "@/components/transactions"
import { Container } from "@/components/view"
import { TransactionBlock, useSui, useSuiClientQuery } from "@/hooks/use-sui"
import { qc } from "@/lib/query"
import { shortenAddress } from "@/lib/utils"

export default function IndexScreen() {
  const { account } = useSui()
  const insets = useSafeAreaInsets()
  const balance = useSuiClientQuery("getBalance", { owner: account.address })
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
          <DepositButton />
          <SendButton />
        </View>
      </Container>
      <Transaction label="Activity" address={account.address} />
    </View>
  )
}

function DepositButton(props: ViewProps) {
  const { account } = useSui()
  const width = Dimensions.get("window").width
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(account.address)
  }

  return (
    <View className="flex-1" {...props}>
      <Button
        variant="default"
        className="flex-1"
        onPress={() => modalRef.current.present()}
      >
        <Icon name="ArrowDownLeft" variant="default" />
        <Text>Deposit</Text>
      </Button>
      <BottomSheetModal ref={modalRef}>
        <BottomSheetView className="px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Deposit</Subheading>
            <Button
              size="sm"
              variant="outline"
              onPress={() => modalRef.current.forceClose()}
            >
              <Icon name="Eye" variant="outline" />
              <Text>Hide</Text>
            </Button>
          </View>
          <View className="items-center pt-12">
            <QRCode value={account.address} size={width * 0.65} />
          </View>
          <View className="flex-row items-center justify-between gap-x-4 pt-4">
            <View className="bg-muted flex-1 rounded-md px-4 py-1">
              <Text className="text-center">
                {shortenAddress(account.address, 24)}
              </Text>
            </View>
            <Button variant="outline" size="sm" onPress={copyToClipboard}>
              <Text>Copy</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  )
}

const sendValidator = z.object({
  amount: z.coerce.number().positive(),
  address: z.string(),
})

function SendButton(props: ViewProps) {
  const { executeTransactionBlock } = useSui()
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const form = useForm<z.infer<typeof sendValidator>>({
    resolver: zodResolver(sendValidator),
    defaultValues: {
      amount: Number((Math.random() * 10).toFixed(5)),
      address:
        "0xd01c593d5e35b66ba6c15cf5dbe2da581fd7e8ed5a9596f1e4f7830180b88f14",
    },
  })

  const handleSubmit = async (args: z.infer<typeof sendValidator>) => {
    try {
      const txb = new TransactionBlock()
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(args.amount * 1e9)])
      txb.transferObjects([coin], txb.pure(args.address))

      await executeTransactionBlock({ transactionBlock: txb })
      await qc.invalidateQueries()
      modalRef.current.forceClose()
    } catch (error) {
      console.log("error:", error)
    }
  }

  return (
    <View className="flex-1" {...props}>
      <Button variant="outline" onPress={() => modalRef.current.present()}>
        <Icon name="ArrowUpRight" variant="outline" />
        <Text>Send</Text>
      </Button>
      <BottomSheetModal ref={modalRef} snapPoints={["25%", "50%"]}>
        <BottomSheetView className="flex-1 px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Send Assets</Subheading>
            <Button
              size="sm"
              variant="outline"
              onPress={() => modalRef.current.forceClose()}
            >
              <Icon name="Eye" variant="outline" />
              <Text>Hide</Text>
            </Button>
          </View>
          <View className="flex-1 space-y-4">
            <View>
              <Controller
                name="amount"
                control={form.control}
                render={({ field: { onChange, onBlur, value }, formState }) => (
                  <View>
                    <Label className="mb-1">Amount</Label>
                    <Input
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      defaultValue={value.toString()}
                    />
                    {formState.errors.amount && (
                      <Text className="text-red-500">
                        {formState.errors.amount.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
            <View>
              <Controller
                name="address"
                control={form.control}
                render={({ field: { onChange, onBlur, value }, formState }) => (
                  <View>
                    <Label className="mb-1">Recipient</Label>
                    <Input
                      numberOfLines={3}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      defaultValue={value}
                      multiline
                    />
                    {formState.errors.address && (
                      <Text className="text-red-500">
                        {formState.errors.address.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
          <Button
            disabled={!form.formState.isValid}
            onPress={form.handleSubmit(handleSubmit)}
          >
            <Icon name="ArrowUpRight" />
            <Text>Send</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  )
}
