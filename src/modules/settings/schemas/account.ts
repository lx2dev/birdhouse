import { createInsertSchema } from "drizzle-zod"

import { user } from "@/server/db/schema"

export const userInsertSchema = createInsertSchema(user)
