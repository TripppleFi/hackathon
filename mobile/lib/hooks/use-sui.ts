import "react-native-get-random-values"

import { useEffect, useMemo, useState } from "react"
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography"
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { parse, useURL } from "expo-linking"

import { useApi, type ApiType } from "@/lib/hooks/use-api"
import { useStorage } from "@/lib/hooks/use-storage"

export function useToken() {
  const url = useURL()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (url) {
      const parsed = parse(url)
      const token = parsed.queryParams?.["id_token"]
      if (token) {
        setToken(String(token))
      }
    }
  }, [url])

  return { token }
}

export function useKeypair() {
  const [ephemeral, setEphemeral] = useStorage(
    "ephemeral",
    Ed25519Keypair.generate().getSecretKey(),
  )

  const keypair = useMemo(
    () =>
      Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(ephemeral).secretKey),
    [ephemeral],
  )

  return {
    keypair,
    resetKeypair() {
      setEphemeral(Ed25519Keypair.generate().getSecretKey())
    },
  }
}

type CeremonyPayload = Parameters<ApiType["auth"]["ceremony"]["post"]>[0]
type CeremonyResponse = Awaited<
  ReturnType<ApiType["auth"]["ceremony"]["post"]>
>["data"]

export type AuthPayload = Parameters<ApiType["auth"]["login"]["post"]>[0]
type AuthResponse = Awaited<
  ReturnType<ApiType["auth"]["login"]["post"]>
>["data"]

export function useLogin() {
  const { api } = useApi()
  const { resetKeypair } = useKeypair()
  const [ceremony, setCeremony] = useStorage<CeremonyResponse>("ceremony", null)
  const [account, setAccount] = useStorage<AuthResponse>("account", null, {
    requireAuthentication: true,
  })

  async function beginCeremony(data: CeremonyPayload) {
    const response = await api.auth.ceremony.post(data)
    if (response.error) return
    setCeremony(response.data)
    return response.data
  }

  async function authenticate(data: AuthPayload) {
    const response = await api.auth.login.post(data)
    if (response.error) return
    setAccount(response.data)
    setCeremony(null)
  }

  function logout() {
    setCeremony(null)
    setAccount(null)
    resetKeypair()
  }

  return { ceremony, beginCeremony, authenticate, account, logout }
}
