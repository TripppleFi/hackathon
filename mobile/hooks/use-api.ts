import { useMemo } from "react"
import { treaty } from "@elysiajs/eden"
import { type Server } from "@trippple/server"

import { useAccount } from "@/hooks/use-sui/sui-account"
import { config } from "@/lib/config"

const headers: Record<string, string> = {
  "Content-Type": "application/json",
}

export function useApi() {
  const { account } = useAccount()
  return {
    api: useMemo(() => {
      if (account?.token) {
        headers["Authorization"] = `Bearer ${account.token}`
      }
      return treaty<Server>(config.EXPO_PUBLIC_API_URL, { headers })
    }, [account?.token]),
  }
}

export type ApiType = ReturnType<typeof treaty<Server>>
