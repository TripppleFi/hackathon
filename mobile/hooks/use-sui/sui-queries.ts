import { useQueries, type UseQueryResult } from "@tanstack/react-query"

import { useSuiClient } from "@/hooks/use-sui/sui"
import {
  withDefaultClientOptions,
  type SuiRpcMethods,
  type UseSuiClientQueryOptions,
} from "@/hooks/use-sui/sui-query"
import { config } from "@/lib/config"

type SuiClientQueryOptions =
  SuiRpcMethods[keyof SuiRpcMethods] extends infer Method
    ? Method extends {
        name: infer M extends keyof SuiRpcMethods
        params?: infer P
      }
      ? undefined extends P
        ? {
            method: M
            params?: P
            options?: UseSuiClientQueryOptions<M, unknown>
          }
        : {
            method: M
            params: P
            options?: UseSuiClientQueryOptions<M, unknown>
          }
      : never
    : never

export type UseSuiClientQueriesResults<
  Args extends readonly SuiClientQueryOptions[],
> = {
  -readonly [K in keyof Args]: Args[K] extends {
    method: infer M extends keyof SuiRpcMethods
    readonly options?:
      | {
          select?: (...args: any[]) => infer R
        }
      | object
  }
    ? UseQueryResult<unknown extends R ? SuiRpcMethods[M]["result"] : R>
    : never
}

export function useSuiClientQueries<
  const Queries extends readonly SuiClientQueryOptions[],
  Results = UseSuiClientQueriesResults<Queries>,
>({
  queries,
  combine,
}: {
  queries: Queries
  combine?: (results: UseSuiClientQueriesResults<Queries>) => Results
}): Results {
  const suiClient = useSuiClient()
  return useQueries({
    combine: combine as never,
    queries: queries.map(query => {
      const {
        method,
        params,
        options: { queryKey = [], ...restOptions } = {},
      } = query

      return {
        ...restOptions,
        queryKey: [config.EXPO_PUBLIC_SUI_NETWORK, method, params, ...queryKey],
        queryFn: async () => {
          return await suiClient[method](withDefaultClientOptions(params))
        },
      }
    }) as [],
  })
}
