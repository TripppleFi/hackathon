import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react"
import {
  CoinBalance,
  SuiClient,
  type CoinMetadata,
} from "@mysten/sui.js/client"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { normalizeStructTag } from "@mysten/sui.js/utils"
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  LendingMarket,
  ParsedReserve,
  parseLendingMarket,
  parseObligation,
  SuilendClient,
} from "@suilend/sdk"
import { type Side } from "@suilend/sdk/core/types"
import * as simulate from "@suilend/sdk/mainnet/utils/simulate"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"

import { useSui, useSuiClient } from "@/hooks/use-sui"

function createSavingsContext() {
  // const { account, executeTransactionBlock } = useSui()
  // const suiClient = useSuiClient()
  // const suilendClientRef = useRef<SuilendClient<string> | null>(
  //   new SuilendClient(null as NewType, suiClient),
  // )
  // if (!suilendClientRef.current) {
  //   suilendClientRef.current =
  //     await SuilendClient.initializeWithLendingMarket(
  //       rawLendingMarket,
  //       suiClient,
  //     );
  // } else suilendClientRef.current.lendingMarket = rawLendingMarket;
}

const SavingsContext = createContext<SavingsContextProps>(null!)

const useSavingsContext = () => useContext(SavingsContext)

function SavingsContextProvider({ children }: PropsWithChildren) {
  return (
    <SavingsContext.Provider value={createSavingsContext()}>
      {children}
    </SavingsContext.Provider>
  )
}

type SavingsContextProps = ReturnType<typeof createSavingsContext>

export { useSavingsContext, SavingsContextProvider }
