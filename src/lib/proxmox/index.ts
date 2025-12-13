import { proxmoxApi } from "proxmox-api"

import { env } from "@/env"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = env.PM_TLS_SKIP_VERIFY ? "0" : "1"

export const proxmox = proxmoxApi({
  host: env.PM_HOST,
  tokenID: env.PM_TOKEN_ID,
  tokenSecret: env.PM_SECRET,
})
