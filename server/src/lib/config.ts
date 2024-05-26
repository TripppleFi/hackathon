import { ip } from "address"
import { z } from "zod"

export enum SuiNetwork {
  mainnet = "mainnet",
  testnet = "testnet",
  devnet = "devnet",
  localnet = "localnet",
}

export const config = z
  .object({
    NODE_ENV: z.enum(["production", "development"]).default("development"),
    PORT: z.coerce.number().default(3000),
    APP_NAME: z.string().default("Trippple.fi"),
    APP_URL: z.preprocess(
      url => url ?? `http://${ip()}:${process.env.PORT ?? "3000"}`,
      z.string(),
    ),
    APP_SECRET: z.string().min(24),
    DATABASE_URL: z.string().default("db.sqlite"),
    DATABASE_TOKEN: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string(),
    TWITCH_CLIENT_ID: z.string(),
    SUI_NETWORK: z.nativeEnum(SuiNetwork).default(SuiNetwork.devnet),
    SUI_PROVER_URL: z.string().url().default("http://localhost:9999/v1"),
  })
  .readonly()
  .parse(process.env)
