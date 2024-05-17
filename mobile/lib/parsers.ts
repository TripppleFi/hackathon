import { z } from "zod"

export const balanceChange = z.object({
  owner: z.object({ AddressOwner: z.string() }),
  coinType: z.literal("0x2::sui::SUI"),
  amount: z.coerce.number(),
})

export const activityParser = z.object({
  digest: z.string(),
  balanceChanges: z.array(balanceChange),
  timestampMs: z.coerce.number(),
})
