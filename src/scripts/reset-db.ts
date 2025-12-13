import { drizzle } from "drizzle-orm/postgres-js"
import { reset } from "drizzle-seed"

import { env } from "@/env"
import * as schema from "@/server/db/schema"

async function main() {
  const db = drizzle(env.DATABASE_URL)

  try {
    console.log("Resetting database...")
    await reset(db, schema)
  } catch (error) {
    console.error("Failed to reset database:", error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("Database reset successfully.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Failed to reset database:", error)
    process.exit(1)
  })
