import proxmoxApi from "proxmox-api"
import type { RequestInit } from "undici"
import { Agent, fetch as undiciFetch } from "undici"

import { env } from "@/env"

const shouldSkipTls = env.PM_TLS_SKIP_VERIFY === "true"

if (shouldSkipTls) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

const insecureAgent = shouldSkipTls
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : null

const proxmoxFetch = shouldSkipTls
  ? async (url: string | URL, init?: RequestInit) => {
      const dispatcherInit = {
        ...(init ?? {}),
        dispatcher: insecureAgent,
      } as RequestInit
      return undiciFetch(url, dispatcherInit)
    }
  : undefined

let proxmoxClient: ReturnType<typeof proxmoxApi> | null = null

export function getProxmoxClient() {
  if (proxmoxClient) return proxmoxClient

  proxmoxClient = proxmoxApi({
    fetch: proxmoxFetch,
    host: env.PM_HOST,
    port: 8006,
    schema: "https",
    tokenID: env.PM_TOKEN_ID,
    tokenSecret: env.PM_SECRET,
  })

  return proxmoxClient
}
