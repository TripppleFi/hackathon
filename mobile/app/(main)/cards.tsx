import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Controller, useForm } from "react-hook-form"
import { Dimensions, View, ViewProps } from "react-native"
import {
  default as Carousel,
  type ICarouselInstance,
} from "react-native-reanimated-carousel"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import * as Clipboard from "expo-clipboard"
import { z } from "zod"

import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetModalMethods,
} from "@/components/bottom-sheet"
import { Button, ButtonProps as ButtonPropsCustom } from "@/components/button"
import { Currency } from "@/components/currency"
import { BrandIcon, Icon } from "@/components/icon"
import { Input } from "@/components/input"
import { Loader } from "@/components/loader"
import {
  Heading,
  Label,
  Subheading,
  Text,
  TextClassProvider,
} from "@/components/text"
import { Transaction, useTransactions } from "@/components/transactions"
import { Container } from "@/components/view"
import { useApi, type ApiType } from "@/hooks/use-api"
import { TransactionBlock, useSui, useSuiClientQuery } from "@/hooks/use-sui"

type ButtonProps = ButtonPropsCustom & {
  onComplete: () => void
}

const CardsContext = createContext<ReturnType<typeof createCardContextProps>>(
  null!,
)

export default function CardsScreen() {
  const insets = useSafeAreaInsets()
  const { isPending, data = [], isError, refetch } = useCards()
  const showCreateNew = !isError && !isPending && data.length === 0

  return (
    <CardsContext.Provider value={createCardContextProps(data)}>
      <View
        className="bg-muted flex-1"
        style={{ paddingTop: showCreateNew ? 0 : insets.top }}
      >
        {!showCreateNew && (
          <Container className="flex-row items-center justify-between pt-4">
            <Heading>My Cards</Heading>
            <NewCardButton onComplete={refetch} />
          </Container>
        )}
        {showCreateNew ? (
          <View className="bg-background flex-1 items-center justify-center space-y-4">
            <Heading>Create your first card</Heading>
            <NewCardButton size="default" onComplete={refetch} />
          </View>
        ) : isPending ? (
          <View className="flex-1 items-center justify-center">
            <Loader size="lg" />
          </View>
        ) : (
          <>
            <CardList cards={data} />
            <CardButtons />
            <CardTransactions />
            <CardDetails />
          </>
        )}
      </View>
    </CardsContext.Provider>
  )
}

interface CardListProps {
  cards: NonNullable<
    Awaited<ReturnType<ApiType["cards"]["index"]["get"]>>["data"]
  >
}

function CardList({ cards }: CardListProps) {
  const width = Dimensions.get("window").width
  const height = width / (3.37 / 2.125)
  const parallaxScrollingScale = 0.85
  const listRef = useRef<ICarouselInstance>(null!)
  const { setActiveCard } = useCardsContext()

  return (
    <View style={{ height }}>
      <Carousel
        data={cards}
        loop={false}
        ref={listRef}
        width={width}
        height={height}
        mode="parallax"
        onSnapToItem={index => setActiveCard(cards[index])}
        renderItem={({ item }) => <Card card={item} />}
        modeConfig={{
          parallaxScrollingScale,
          parallaxAdjacentItemScale: Math.pow(parallaxScrollingScale, 3),
        }}
      />
    </View>
  )
}

function CardButtons() {
  const { activeCard, detailsModalRef } = useCardsContext()
  const cards = useCards()
  const transactions = useTransactions(activeCard?.address)
  const balance = useSuiClientQuery("getBalance", {
    owner: String(activeCard?.address),
  })

  const refreshCardDetails = useCallback(async () => {
    await Promise.all([
      cards.refetch(),
      balance.refetch(),
      transactions.refetch(),
    ])
  }, [cards, balance, transactions])

  if (!activeCard) return null

  return (
    <Container>
      <Label className="mb-1">Card Actions</Label>
      <View className="flex-row justify-between gap-4">
        <FundButton className="flex-1" onComplete={refreshCardDetails} />
        <WithdrawButton className="flex-1" onComplete={refreshCardDetails} />
        {activeCard.status === "active" && (
          <Button
            variant="secondary"
            size="icon"
            onPress={() => detailsModalRef.current.present()}
          >
            <Icon name="Eye" variant="secondary" size={24} />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onPress={() => detailsModalRef.current.present()}
        >
          <Icon name="Eye" variant="outline" size={24} />
        </Button>
      </View>
    </Container>
  )
}

function CardTransactions() {
  const { activeCard } = useCardsContext()

  return <Transaction label="Transactions" address={activeCard?.address} />
}

function CardDetails() {
  const { activeCard, detailsModalRef } = useCardsContext()
  if (!activeCard) return null
  return (
    <BottomSheetModal ref={detailsModalRef} snapPoints={["25%", "65%"]}>
      <BottomSheetView className="px-8 py-4">
        <View className="flex-row items-center justify-between pb-4">
          <Subheading>Card Details</Subheading>
          <Button
            size="sm"
            variant="outline"
            onPress={() => detailsModalRef.current.forceClose()}
          >
            <Icon name="Eye" variant="outline" />
            <Text>Hide</Text>
          </Button>
        </View>
        <View className="h-56 pb-4">
          <Card card={activeCard} />
        </View>
        {activeCard.status === "active" && (
          <View>
            <CardLine label="Card name" value={activeCard.nameOnCard} />
            <CardLine label="Card number" value={activeCard.accountNumber} />
            <CardLine label="Expiry date" value={activeCard.expiry} />
            <CardLine
              label="CVV (Security code)"
              value={activeCard.securityCode}
            />
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

interface CardProps {
  card: CardListProps["cards"][number]
}

function Card({ card }: CardProps) {
  const balance = useSuiClientQuery("getBalance", { owner: card.address })
  return (
    <TextClassProvider value="text-white">
      <View className="flex-1">
        <View className="bg-foreground flex-1 justify-between rounded-xl p-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-4">
              <BrandIcon className="text-background" name="visa" size={36} />
              <Text className="font-uiBold text-background">{card.label}</Text>
            </View>
            <View>
              <View className="border-background rounded-sm border px-1">
                <Label className="text-background">{card.status}</Label>
              </View>
            </View>
          </View>
          <View>
            <Label className="text-background">Total Balance</Label>
            <Currency
              className="text-background font-uiMedium text-3xl"
              amount={Number(balance.data?.totalBalance ?? 0) / 1e9}
            />
          </View>
          <View className="flex-row justify-between">
            {card.status === "active" && (
              <View>
                <Label className="text-background">PAN</Label>
                <Text className="text-background">**** 9233</Text>
              </View>
            )}
            {card.status === "active" && (
              <View className="items-end">
                <Label className="text-background">Valid Thru</Label>
                <Text className="text-background">05/28</Text>
              </View>
            )}
          </View>
          {card.status === "inactive" && (
            <Text className="text-red-500">
              Please fund your card to get started
            </Text>
          )}
        </View>
      </View>
    </TextClassProvider>
  )
}

type CardLineProps = ViewProps & {
  label: string
  value: string | number | null
}

function CardLine(props: CardLineProps) {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(String(props.value))
  }

  return (
    <View className="flex-row items-center justify-between" style={props.style}>
      <Label className="text-base">{props.label}</Label>
      <Button variant="ghost" onPress={copyToClipboard}>
        <Text>{props.value}</Text>
      </Button>
    </View>
  )
}

const newCardValidator = z.object({
  label: z.string().min(3),
})

function NewCardButton({ size = "sm", ...props }: ButtonProps) {
  const { api } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const form = useForm<z.infer<typeof newCardValidator>>({
    resolver: zodResolver(newCardValidator),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { label: "Gaming" },
  })

  const mutation = useMutation({
    mutationFn(args: z.infer<typeof newCardValidator>) {
      return api.cards.index.post(args)
    },
  })

  const handleSubmit = async (args: z.infer<typeof newCardValidator>) => {
    try {
      setIsLoading(true)
      await mutation.mutateAsync(args)
      await props.onComplete()
      modalRef.current.forceClose()
    } catch (error) {
      console.log("error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        {...props}
        onPress={() => modalRef.current.present()}
      >
        <Icon name="Plus" variant="outline" />
        <Text>New Card</Text>
      </Button>

      <BottomSheetModal ref={modalRef} isLoading={isLoading}>
        <BottomSheetView className="flex-1 px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Create New Card</Subheading>
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
                name="label"
                control={form.control}
                render={({ field: { onChange, onBlur, value }, formState }) => (
                  <View>
                    <Label className="mb-1">Label</Label>
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      defaultValue={value}
                    />
                    {formState.errors.label && (
                      <Text className="text-red-500">
                        {formState.errors.label.message}
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
            <Icon name="Plus" />
            <Text>Create Card</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

const fundCardValidator = z.object({
  amount: z.coerce.number().positive(),
})

function FundButton(props: ButtonProps) {
  const { api } = useApi()
  const { activeCard } = useCardsContext()
  const { executeTransactionBlock } = useSui()
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const form = useForm<z.infer<typeof fundCardValidator>>({
    resolver: zodResolver(fundCardValidator),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { amount: 10 },
  })

  const mutation = useMutation({
    async mutationFn(args: z.infer<typeof fundCardValidator>) {
      if (!activeCard) return
      const txb = new TransactionBlock()
      const [coin] = txb.splitCoins(txb.gas, [
        txb.pure(new BigNumber(args.amount).multipliedBy(1e9).toNumber()),
      ])

      txb.transferObjects([coin], txb.pure(activeCard.address))

      await executeTransactionBlock({ transactionBlock: txb })
      return api.cards.fund.post({ address: activeCard.address })
    },
  })

  const handleSubmit = async (args: z.infer<typeof fundCardValidator>) => {
    try {
      setIsLoading(true)
      await mutation.mutateAsync(args)
      await props.onComplete()
      modalRef.current.forceClose()
    } catch (error) {
      console.log("error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button {...props} onPress={() => modalRef.current.present()}>
        <Icon name="ArrowDownLeft" variant={props.variant ?? "default"} />
        <Text>Fund Card</Text>
      </Button>

      <BottomSheetModal ref={modalRef} isLoading={isLoading}>
        <BottomSheetView className="flex-1 px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Fund Card</Subheading>
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
                      defaultValue={String(value)}
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
          </View>
          <Button
            disabled={!form.formState.isValid}
            onPress={form.handleSubmit(handleSubmit)}
          >
            <Icon name="ArrowDownLeft" />
            <Text>Add Funds to Card</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

const withdrawCardValidator = z.object({
  amount: z.coerce.number().positive(),
})

function WithdrawButton(props: ButtonProps) {
  const { api } = useApi()
  const { activeCard } = useCardsContext()
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const form = useForm<z.infer<typeof withdrawCardValidator>>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(withdrawCardValidator),
    defaultValues: { amount: 10 },
  })

  const mutation = useMutation({
    async mutationFn(args: z.infer<typeof withdrawCardValidator>) {
      return api.cards.withdraw.post({ ...args, id: String(activeCard?.id) })
    },
  })

  const handleSubmit = async (args: z.infer<typeof withdrawCardValidator>) => {
    try {
      setIsLoading(true)
      await mutation.mutateAsync(args)
      await props.onComplete()
      modalRef.current.forceClose()
    } catch (error) {
      console.log("error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        {...props}
        variant="outline"
        disabled={activeCard?.status === "inactive"}
        onPress={() => modalRef.current.present()}
      >
        <Icon name="ArrowUpRight" variant="outline" />
        <Text>Withdraw</Text>
      </Button>

      <BottomSheetModal ref={modalRef} isLoading={isLoading}>
        <BottomSheetView className="flex-1 px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Withdraw funds</Subheading>
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
                      defaultValue={String(value)}
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
          </View>
          <Button
            disabled={!form.formState.isValid}
            onPress={form.handleSubmit(handleSubmit)}
          >
            <Icon name="ArrowUpRight" />
            <Text>Withdraw to wallet</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

function createCardContextProps(cards: CardListProps["cards"]) {
  const [activeCard, setActiveCard] = useState<
    CardListProps["cards"][number] | null
  >(cards[0])
  const detailsModalRef = useRef<BottomSheetModalMethods>(null!)

  useEffect(() => {
    if (cards.length > 0) {
      setActiveCard(cards[0])
    }
  }, [cards])

  return { activeCard, setActiveCard, detailsModalRef }
}

function useCardsContext() {
  return useContext(CardsContext)
}

function useCards() {
  const { api } = useApi()
  return useQuery({
    queryKey: ["useCards"],
    async queryFn() {
      const response = await api.cards.index.get()
      if (response.error) throw response.error
      return response.data
    },
  })
}
