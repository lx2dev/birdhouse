import { createInsertSchema } from "drizzle-zod"

import { account, user } from "@/server/db/schema"

export const userInsertSchema = createInsertSchema(user)

export const accountInsertSchema = createInsertSchema(account)
