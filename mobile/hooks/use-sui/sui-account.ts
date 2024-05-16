import { type ApiType } from "@/hooks/use-api"
import { useStorage } from "@/hooks/use-storage"

export function useAccount() {
  const [account, setAccount] = useStorage<AuthResponse>("account", null, {
    requireAuthentication: true,
  })

  return { account, setAccount }
}

type AuthResponse = Awaited<
  ReturnType<ApiType["auth"]["login"]["post"]>
>["data"]
