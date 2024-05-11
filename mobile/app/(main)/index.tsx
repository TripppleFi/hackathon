import { View } from "react-native"

import { Button } from "@/components/button"
import { Text } from "@/components/text"
import { useKeypair, useLogin, useToken } from "@/lib/hooks/use-sui"

export default function IndexScreen() {
  const { token } = useToken()
  const { keypair } = useKeypair()
  const { ceremony, account, logout } = useLogin()

  return (
    <View>
      <Button onPress={logout}>
        <Text>Logout</Text>
      </Button>
      <Text>keypair: {keypair.getPublicKey().toSuiAddress()}</Text>
      <Text>token: {token}</Text>
      <Text>ceremony: {JSON.stringify(ceremony, null, 2)}</Text>
      <Text>account: {JSON.stringify(account, null, 2)}</Text>
    </View>
  )
}
