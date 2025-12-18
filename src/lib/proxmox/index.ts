import proxmoxApi from "proxmox-api"

import { env } from "@/env"

process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  env.PM_TLS_SKIP_VERIFY === "true" ? "0" : "1"

let proxmoxClient: ReturnType<typeof proxmoxApi> | null = null

export function getProxmoxClient() {
  if (proxmoxClient) return proxmoxClient

  proxmoxClient = proxmoxApi({
    host: env.PM_HOST,
    tokenID: env.PM_TOKEN_ID,
    tokenSecret: env.PM_SECRET,
  })

  return proxmoxClient
}
