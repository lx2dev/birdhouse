CREATE TABLE "birdhouse_two_factor" (
	"backup_codes" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "birdhouse_user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "birdhouse_two_factor" ADD CONSTRAINT "birdhouse_two_factor_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "birdhouse_two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "birdhouse_two_factor" USING btree ("user_id");