import Constants from "expo-constants"
import { z } from "zod"

export enum SuiNetwork {
  mainnet = "mainnet",
  testnet = "testnet",
  devnet = "devnet",
}

export const config = z
  .object({
    EXPO_PUBLIC_API_URL: z
      .string()
      .url()
      .default(`http://${Constants.expoConfig?.hostUri?.split(":")[0]}:3000`),
    EXPO_PUBLIC_SUI_NETWORK: z
      .nativeEnum(SuiNetwork)
      .default(SuiNetwork.testnet),
  })
  .readonly()
  .parse(process.env)
