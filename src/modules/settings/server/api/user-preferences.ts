import { eq, sql } from "drizzle-orm"

import { userPreferencesSchema } from "@/schemas/user-preferences"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { userPreferencesTable } from "@/server/db/schema"

export const userPreferencesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const [preferences] = await ctx.db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, ctx.session.user.id))

    return userPreferencesSchema.parse(preferences?.preferences ?? {})
  }),

  // TODO: Send notifications to user depending on what they have enabled in their preferences
  update: protectedProcedure
    .input(userPreferencesSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const preferences = userPreferencesSchema.parse(input)

      const [updatedPreferences] = await ctx.db
        .insert(userPreferencesTable)
        .values({
          preferences: sql`${JSON.stringify(preferences)}::jsonb`,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          set: {
            preferences: sql`${JSON.stringify(preferences)}::jsonb`,
          },
          target: userPreferencesTable.userId,
        })
        .returning()

      return updatedPreferences
    }),
})
