CREATE TABLE "birdhouse_user_preferences" (
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "birdhouse_user_preferences" ADD CONSTRAINT "birdhouse_user_preferences_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_preferences_userId_idx" ON "birdhouse_user_preferences" USING btree ("user_id");