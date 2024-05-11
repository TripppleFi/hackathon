import { AppState } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query"

export const qc = new QueryClient()

function onlineManagement() {
  onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected)
    })
  })
}

function focusManagement() {
  const subscription = AppState.addEventListener("change", function (status) {
    focusManager.setFocused(status === "active")
  })

  return () => subscription.remove()
}

export { onlineManagement, focusManagement }
