import { useQuery } from "@tanstack/react-query"

import { useSui } from "@/hooks/use-sui"

export function useBalance() {
  const { account, suiClient } = useSui()
  return useQuery({
    queryKey: ["useBalance"],
    async queryFn() {
      return suiClient.getBalance({ owner: account.address })
    },
  })
}
