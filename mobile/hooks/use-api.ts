import { useRef } from "react"
import { treaty } from "@elysiajs/eden"
import { type Server } from "@supple/server"

import { config } from "@/lib/config"

const headers: Record<string, string> = {
  "Content-Type": "application/json",
}

export function useApi() {
  const ref = useRef(treaty<Server>(config.EXPO_PUBLIC_API_URL, { headers }))
  return { api: ref.current }
}

export type ApiType = ReturnType<typeof treaty<Server>>
