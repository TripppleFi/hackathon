import type { SuiClient } from "@mysten/sui.js/client"
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query"

import { type PartialBy } from "@/components/types"
import { useSuiClient } from "@/hooks/use-sui/sui"
import { config } from "@/lib/config"

export type SuiRpcMethodName = {
  [K in keyof SuiClient]: SuiClient[K] extends
    | ((input: any) => Promise<any>)
    | (() => Promise<any>)
    ? K
    : never
}[keyof SuiClient]

export type SuiRpcMethods = {
  [K in SuiRpcMethodName]: SuiClient[K] extends (
    input: infer P,
  ) => Promise<infer R>
    ? {
        name: K
        result: R
        params: P
      }
    : SuiClient[K] extends () => Promise<infer R>
      ? {
          name: K
          result: R
          params: undefined | object
        }
      : never
}

export type UseSuiClientQueryOptions<
  T extends keyof SuiRpcMethods,
  TData,
> = PartialBy<
  Omit<
    UseQueryOptions<SuiRpcMethods[T]["result"], Error, TData, unknown[]>,
    "queryFn"
  >,
  "queryKey"
>

export function useSuiClientQuery<
  T extends keyof SuiRpcMethods,
  TData = SuiRpcMethods[T]["result"],
>(
  ...args: undefined extends SuiRpcMethods[T]["params"]
    ? [
        method: T,
        params?: SuiRpcMethods[T]["params"],
        options?: UseSuiClientQueryOptions<T, TData>,
      ]
    : [
        method: T,
        params: SuiRpcMethods[T]["params"],
        options?: UseSuiClientQueryOptions<T, TData>,
      ]
): UseQueryResult<TData, Error> {
  const suiClient = useSuiClient()
  const [method, params, { queryKey = [], ...options } = {}] = args as [
    method: T,
    params?: SuiRpcMethods[T]["params"],
    options?: UseSuiClientQueryOptions<T, TData>,
  ]

  return useQuery({
    ...options,
    queryKey: [config.EXPO_PUBLIC_SUI_NETWORK, method, params, ...queryKey],
    queryFn: async () => {
      return await suiClient[method](withDefaultClientOptions(params))
    },
  })
}

export function withDefaultClientOptions<T extends keyof SuiRpcMethods>(
  params: SuiRpcMethods[T]["params"] | undefined,
) {
  return Object.assign(
    {
      options: {
        showBalanceChanges: true,
        showEffects: true,
        showEvents: false,
      },
    },
    params as never,
  )
}
