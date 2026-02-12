import "server-only"

import { startProvisionRunner } from "@/server/workers/provision-runner"

let initialized = false

export function initializeServer() {
  if (initialized) return

  initialized = true

  void startProvisionRunner()
}
