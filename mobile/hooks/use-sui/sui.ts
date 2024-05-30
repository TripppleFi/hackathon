import "@/lib/polyfill"

import { useEffect, useMemo, useState } from "react"
import {
  getFullnodeUrl,
  SuiClient,
  type ExecuteTransactionBlockParams,
} from "@mysten/sui.js/client"
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography"
import { getFaucetHost, requestSuiFromFaucetV1 } from "@mysten/sui.js/faucet"
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import { genAddressSeed, getZkLoginSignature } from "@mysten/zklogin"
import { parse, useURL } from "expo-linking"

import { useApi, type ApiType } from "@/hooks/use-api"
import { useStorage } from "@/hooks/use-storage"
import { useAccount } from "@/hooks/use-sui/sui-account"
import { config } from "@/lib/config"

function useSuiNetwork() {
  return { network: config.EXPO_PUBLIC_SUI_NETWORK }
}

function useSuiClient() {
  const { network } = useSuiNetwork()
  return useMemo(
    () =>
      new SuiClient({
        url: `https://sui-${network}-endpoint.blockvision.org/`,
      }),
    [],
  )
  return useMemo(() => new SuiClient({ url: getFullnodeUrl(network) }), [])
}

function useKeypair() {
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

function useToken() {
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

function useLogin() {
  const { api } = useApi()
  const { setAccount } = useAccount()
  const { resetKeypair } = useKeypair()
  const [ceremony, setCeremony] = useStorage<CeremonyResponse>("ceremony", null)

  const beginCeremony = async (data: CeremonyPayload) => {
    const response = await api.auth.ceremony.post(data)
    if (response.error) return
    setCeremony(response.data)
    return response.data
  }

  const authenticate = async (data: AuthPayload) => {
    const response = await api.auth.login.post(data)
    if (response.error) return
    setAccount(response.data)
    setCeremony(null)
  }

  const logout = () => {
    setCeremony(null)
    setAccount(null)
    resetKeypair()
  }

  return { ceremony, beginCeremony, authenticate, logout }
}

function useSui() {
  const { account } = useAccount()
  const { keypair } = useKeypair()
  const suiClient = useSuiClient()

  const executeTransactionBlock = async ({
    transactionBlock,
    requestType = "WaitForLocalExecution",
    options,
  }: ExecuteTransactionBlockProps) => {
    transactionBlock.setSender(String(account?.address))
    const { bytes, signature: userSignature } = await transactionBlock.sign({
      client: suiClient,
      signer: keypair,
    })

    const addressSeed = genAddressSeed(
      account!.salt,
      "sub",
      account!.sub,
      account!.aud,
    ).toString()

    const signature = getZkLoginSignature({
      inputs: { ...account!.proofs, addressSeed },
      maxEpoch: account!.maxEpoch,
      userSignature,
    })

    return suiClient.executeTransactionBlock({
      signature,
      transactionBlock: bytes,
      requestType,
      ...(options && { options }),
    })
  }

  const requestAirdrop = async () => {
    if (config.EXPO_PUBLIC_SUI_NETWORK === "mainnet") return

    console.log("aidropping......")
    const response = await requestSuiFromFaucetV1({
      host: getFaucetHost(config.EXPO_PUBLIC_SUI_NETWORK),
      recipient: String(account?.address),
    })

    if (response.error) {
      console.log("error:", response.error)
    } else {
      console.log("done")
    }
  }

  return { executeTransactionBlock, requestAirdrop, account: account! }
}

type CeremonyPayload = Parameters<ApiType["auth"]["ceremony"]["post"]>[0]
type CeremonyResponse = Awaited<
  ReturnType<ApiType["auth"]["ceremony"]["post"]>
>["data"]

type AuthPayload = Parameters<ApiType["auth"]["login"]["post"]>[0]

type ExecuteTransactionBlockProps = Pick<
  ExecuteTransactionBlockParams,
  "options" | "requestType"
> & {
  transactionBlock: TransactionBlock
}

export {
  useSuiNetwork,
  useSuiClient,
  useKeypair,
  useToken,
  useLogin,
  useSui,
  type AuthPayload,
}

export { TransactionBlock } from "@mysten/sui.js/transactions"
