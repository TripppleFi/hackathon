import Constants from "expo-constants"
import { z } from "zod"

export const config = z
  .object({
    EXPO_PUBLIC_API_URL: z
      .string()
      .url()
      .default(["http", Constants.linkingUri.split(":")[1], 3000].join(":")),
  })
  .readonly()
  .parse(process.env)
