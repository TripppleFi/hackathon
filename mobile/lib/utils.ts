import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { config } from "@/lib/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function idFactory(label: string) {
  let i = 0
  return {
    next(inner?: string) {
      return `${label}${inner}${i++}`
    },
  }
}

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

export function shortenAddress(address: string, offset = 6) {
  return `${address.slice(0, 6)}...${address.slice(-1 * offset)}`
}

export function numberFormat(number: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(number)
}

export function server(url: string, params?: Record<string, string>) {
  const builder = new URL(url, config.EXPO_PUBLIC_API_URL)
  builder.search = new URLSearchParams(params).toString()
  return builder.toString()
}
