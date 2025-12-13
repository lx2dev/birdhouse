import { drizzle } from "drizzle-orm/postgres-js"
import { seed } from "drizzle-seed"

import { env } from "@/env"
import * as schema from "@/server/db/schema"

async function main() {
  const db = drizzle(env.DATABASE_URL)

  try {
    console.log("Seeding database...")
    await seed(db, schema)
  } catch (error) {
    console.error("Failed to seed database:", error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("Database seeded successfully.")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Failed to seed database:", error)
    process.exit(1)
  })
