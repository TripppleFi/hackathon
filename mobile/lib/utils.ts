import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { config } from "@/lib/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function idGenerator(label: string) {
  let i = 0
  const e = Math.random().toString(16).slice(2)

  return {
    next() {
      return `${label}${e}${i++}`
    },
  }
}

export function server(url: string, params?: Record<string, string>) {
  const builder = new URL(url, config.EXPO_PUBLIC_API_URL)
  builder.search = new URLSearchParams(params).toString()
  return builder.toString()
}
