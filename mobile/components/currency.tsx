import { View, type TextProps } from "react-native"
import { Skeleton } from "moti/skeleton"

import { Sui } from "@/components/icon"
import { Text } from "@/components/text"
import { numberFormat } from "@/lib/utils"

interface CurrencyProps {
  amount: number
  style?: TextProps["style"]
  className?: string
  isPending?: boolean
}

export function Currency({ style, amount, isPending }: CurrencyProps) {
  return (
    <View>
      <Skeleton show={isPending}>
        <View className="flex-row items-center">
          {amount < 0 && (
            <Text className="mr-[2px] text-base" style={style}>
              -
            </Text>
          )}
          <Sui className="text-foreground text-base" style={style} />
          <Text className="mr-[2px] text-base" style={style}>
            {numberFormat(Math.abs(amount))}
          </Text>
        </View>
      </Skeleton>
    </View>
  )
}
