DROP INDEX "audit_log_createdAt_idx";--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "birdhouse_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_resourceType_idx" ON "birdhouse_audit_log" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "audit_log_userId_createdAt_id_idx" ON "birdhouse_audit_log" USING btree ("user_id","created_at","id");