import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import type { NextRequest } from "next/server"

import { env } from "@/env"
import { createTRPCContext } from "@/server/api/init"
import { appRouter } from "@/server/api/root"

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  })
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    createContext: () => createContext(req),
    endpoint: "/api/trpc",
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `[TRPC] Error on ${path ?? "<no-path>"}: ${error.message}`,
            )
          }
        : undefined,
    req,
    router: appRouter,
  })

export { handler as GET, handler as POST }
