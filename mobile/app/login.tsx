import { useEffect } from "react"
import { View } from "react-native"
import { useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import {
  useKeypair,
  useLogin,
  useToken,
  type AuthPayload,
} from "@/lib/hooks/use-sui"
import { server } from "@/lib/utils"

export default function LoginScreen() {
  const { token } = useToken()
  const { keypair } = useKeypair()
  const { ceremony, beginCeremony } = useLogin()
  const ephemeralPublicKey = keypair.getPublicKey().toBase64()

  async function handlePress(platform: string) {
    const ceremony = await beginCeremony({ ephemeralPublicKey })
    await WebBrowser.openBrowserAsync(
      server(`auth/redirect/${platform}`, { nonce: String(ceremony?.nonce) }),
    )
  }

  if (token && ceremony) {
    return (
      <FinalizeLogin
        payload={{
          token,
          ephemeralPublicKey,
          maxEpoch: ceremony.maxEpoch,
          randomness: ceremony.randomness,
        }}
      />
    )
  }

  return (
    <View className="flex-1 flex-col items-center justify-center gap-6">
      <Button size="lg" onPress={() => handlePress("google")}>
        <Text>Google</Text>
      </Button>
      <Button size="lg" onPress={() => handlePress("twitch")}>
        <Text>Twitch</Text>
      </Button>
    </View>
  )
}

interface FinalizeProps {
  payload: AuthPayload
}

function FinalizeLogin({ payload }: FinalizeProps) {
  const router = useRouter()
  const { authenticate } = useLogin()

  useEffect(() => {
    authenticate(payload).then(() => {
      router.replace("/")
    })
  }, [])

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Generating zk proofs...</Text>
      <Text>{JSON.stringify(payload, null, 2)}</Text>
    </View>
  )
}
