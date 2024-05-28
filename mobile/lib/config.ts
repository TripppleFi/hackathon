import { z } from "zod"

export enum SuiNetwork {
  mainnet = "mainnet",
  testnet = "testnet",
  devnet = "devnet",
}

export const config = z
  .object({
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_PUBLIC_SUI_NETWORK: z
      .nativeEnum(SuiNetwork)
      .default(SuiNetwork.devnet),
  })
  .readonly()
  .parse(process.env)
