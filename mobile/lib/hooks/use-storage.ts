import React, { useSyncExternalStore } from "react"
import { NativeEventEmitter } from "react-native"
import * as SecureStore from "expo-secure-store"

const event = new NativeEventEmitter()
export async function setStorageItem(key: string, value: string | null) {
  if (value === null) {
    await SecureStore.deleteItemAsync(key)
    event.emit("storage", null)
  } else {
    await SecureStore.setItem(key, value)
    event.emit("storage", value)
  }
}

export function getStorageItem(
  key: string,
  opts: SecureStore.SecureStoreOptions = {},
) {
  return SecureStore.getItem(key, opts)
}

function storageSubscriber(callback: () => void) {
  event.addListener("storage", callback)
  return () => {
    event.removeAllListeners("storage")
    callback()
  }
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  opts: SecureStore.SecureStoreOptions = {},
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const store = useSyncExternalStore(storageSubscriber, () => {
    return getStorageItem(key, opts)
  })

  const setState = React.useCallback(
    (v: React.SetStateAction<T>) => {
      try {
        const nextState = // @ts-expect-error how to split T from ()=>T?
          (typeof v === "function" ? v(JSON.parse(store ?? "") as T) : v) as T

        setStorageItem(key, nextState ? JSON.stringify(nextState) : null)
      } catch (e) {
        console.warn(e)
      }
    },
    [key, store],
  )

  React.useEffect(() => {
    if (!getStorageItem(key, opts) && Boolean(initialValue)) {
      setStorageItem(key, JSON.stringify(initialValue))
    }
  }, [key, initialValue])

  return [store ? (JSON.parse(store) as T) : initialValue, setState]
}
