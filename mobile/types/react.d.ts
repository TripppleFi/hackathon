import type { ReactNode } from "react"

declare global {
  type WithChildren<T extends object = object> = T & { children: ReactNode }
}
