import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client"

import { config } from "./config"

export function getSuiClient() {
  return new SuiClient({
    url: getFullnodeUrl(config.SUI_NETWORK),
  })
}
