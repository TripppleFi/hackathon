import { init } from "@paralleldrive/cuid2"
import { Err, Ok, type Result } from "oxide.ts"

export const generateRandomStr = (length = 24) => init({ length })()
export const generateId = () => generateRandomStr()

export async function safeFetch<R, E = unknown>(
  url: string,
  options?: Omit<RequestInit, "body"> & {
    body: XMLHttpRequestBodyInit | object
  },
): Promise<Result<R, E> | undefined> {
  try {
    const body = JSON.stringify(options?.body)
    const headers = { "Content-Type": "application/json" }
    const response = await fetch(url, {
      ...options,
      body,
      headers: { ...headers, ...options?.headers },
    })

    const data = await response.json()
    if (!response.ok) {
      return Err(data)
    }

    return Ok(data)
  } catch (error) {}
}
