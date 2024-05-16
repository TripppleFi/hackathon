import { createContext, useContext, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { Dimensions, SectionList, View, ViewProps } from "react-native"
import {
  default as Carousel,
  type ICarouselInstance,
} from "react-native-reanimated-carousel"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as Clipboard from "expo-clipboard"
import { z } from "zod"

import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetModalMethods,
} from "@/components/bottom-sheet"
import { Button, ButtonProps } from "@/components/button"
import { Currency } from "@/components/currency"
import { BrandIcon, Icon } from "@/components/icon"
import { Input } from "@/components/input"
import {
  Heading,
  Label,
  Subheading,
  Text,
  TextClassProvider,
} from "@/components/text"
import { Container } from "@/components/view"
import { useApi } from "@/hooks/use-api"
import { TransactionBlock } from "@/hooks/use-sui"
import { qc } from "@/lib/query"
import { idFactory } from "@/lib/utils"

const id = idFactory("Cards")
const CardsContext = createContext<ReturnType<typeof cardsContextProps>>(null!)

export default function CardsScreen() {
  const insets = useSafeAreaInsets()
  const { isPending, data, isError } = useCards()
  const showCreateNew = !isError && !isPending && data.length === 0

  return (
    <CardsContext.Provider value={cardsContextProps()}>
      <View className="bg-muted flex-1" style={{ paddingTop: insets.top }}>
        {!showCreateNew && (
          <Container className="flex-row items-center justify-between pt-4">
            <Heading>My Cards</Heading>
            <NewCardButton />
          </Container>
        )}
        {showCreateNew ? (
          <View className="flex-1 items-center justify-center space-y-4">
            <Heading>Create your first card</Heading>
            <NewCardButton size="default" />
          </View>
        ) : (
          <>
            <CardList />
            <CardButtons />
            <CardTransactions />
            <CardDetails />
          </>
        )}
      </View>
    </CardsContext.Provider>
  )
}

function CardList() {
  const data = [...new Array(3).keys()]
  const width = Dimensions.get("window").width
  const height = width / (3.37 / 2.125)
  const parallaxScrollingScale = 0.85
  const listRef = useRef<ICarouselInstance>(null!)

  return (
    <View style={{ height }}>
      <Carousel
        data={data}
        loop={false}
        ref={listRef}
        width={width}
        height={height}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale,
          parallaxAdjacentItemScale: Math.pow(parallaxScrollingScale, 3),
        }}
        renderItem={() => <Card />}
      />
    </View>
  )
}

function CardButtons() {
  const { detailsModalRef } = useCardsContext()
  const handleShowCardDetails = () => {
    detailsModalRef.current.present()
  }

  return (
    <Container>
      <Label className="mb-1">Card Actions</Label>
      <View className="flex-row justify-between gap-4">
        <Button variant="default" className="flex-1">
          <Icon name="ArrowDownLeft" variant="default" />
          <Text>Fund Card</Text>
        </Button>
        <Button variant="outline" className="flex-1">
          <Icon name="ArrowUpRight" variant="outline" />
          <Text>Withdraw</Text>
        </Button>
        <Button variant="secondary" size="icon" onPress={handleShowCardDetails}>
          <Icon name="Eye" variant="secondary" size={24} />
        </Button>
      </View>
    </Container>
  )
}

function CardTransactions() {
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
      <Subheading className="pt-4">Transactions</Subheading>
      <SectionList
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
      />
    </Container>
  )
}

function CardDetails() {
  const { detailsModalRef } = useCardsContext()
  return (
    <BottomSheetModal ref={detailsModalRef} snapPoints={["25%", "65%"]}>
      <BottomSheetView className="px-8 py-4">
        <View className="flex-row items-center justify-between pb-4">
          <Subheading>Card Details</Subheading>
          <Button
            size="sm"
            variant="outline"
            onPress={() => detailsModalRef.current.close()}
          >
            <Icon name="Eye" variant="outline" />
            <Text>Hide</Text>
          </Button>
        </View>
        <View className="h-56 pb-4">
          <Card />
        </View>
        <View>
          <CardLine label="Card name" value="Otumokpor One" />
          <CardLine label="Card number" value="4253 8293 7310 9530" />
          <CardLine label="Expiry date" value="05/28" />
          <CardLine label="CVV (Security code)" value="419" />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

function Card() {
  return (
    <TextClassProvider value="text-white">
      <View className="flex-1">
        <View className="bg-foreground flex-1 justify-between rounded-xl p-8">
          <View className="flex-row items-center gap-x-4">
            <BrandIcon className="text-white" name="visa" size={36} />
            <Text className="font-uiBold">Gaming</Text>
          </View>
          <View>
            <Label>Total Balance</Label>
            <Currency
              className="text-background font-uiMedium text-3xl"
              amount={1e12 / 1e9}
            />
          </View>
          <View className="flex-row justify-between">
            <View>
              <Label>PAN</Label>
              <Text>**** 9233</Text>
            </View>
            <View className="items-end">
              <Label>Valid Thru</Label>
              <Text>05/28</Text>
            </View>
          </View>
        </View>
      </View>
    </TextClassProvider>
  )
}

type CardLineProps = ViewProps & { label: string; value: string }

function CardLine(props: CardLineProps) {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(props.value)
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
  const modalRef = useRef<BottomSheetModalMethods>(null!)
  const form = useForm<z.infer<typeof newCardValidator>>({
    resolver: zodResolver(newCardValidator),
    defaultValues: { label: "Gaming" },
  })

  const mutation = useMutation({
    mutationFn(args: z.infer<typeof newCardValidator>) {
      return api.cards.index.post(args)
    },
  })

  const handleSubmit = async (args: z.infer<typeof newCardValidator>) => {
    try {
      await mutation.mutateAsync(args)
      await qc.invalidateQueries()
    } catch (error) {
      console.log("error:", error)
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

      <BottomSheetModal ref={modalRef} snapPoints={["25%", "50%"]}>
        <BottomSheetView className="flex-1 px-8 py-4">
          <View className="flex-row items-center justify-between pb-4">
            <Subheading>Create New Card</Subheading>
            <Button
              size="sm"
              variant="outline"
              onPress={() => modalRef.current.close()}
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
            <Icon name="ArrowUpRight" />
            <Text>Send</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

function cardsContextProps() {
  return { detailsModalRef: useRef<BottomSheetModalMethods>(null!) }
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
