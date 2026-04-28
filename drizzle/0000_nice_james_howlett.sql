CREATE TYPE "public"."notification_status" AS ENUM('success', 'failure', 'alert', 'info');--> statement-breakpoint
CREATE TYPE "public"."operating_system_status" AS ENUM('available', 'unavailable', 'testing');--> statement-breakpoint
CREATE TYPE "public"."vm_status" AS ENUM('running', 'stopped', 'provisioning', 'suspended', 'error', 'deleting', 'rebooting');--> statement-breakpoint
CREATE TYPE "public"."vm_template_status" AS ENUM('available', 'unavailable', 'testing');--> statement-breakpoint
CREATE TABLE "birdhouse_account" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp with time zone,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_audit_log" (
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"details" jsonb NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"resource_id" text,
	"resource_type" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_notification" (
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"status" "notification_status" DEFAULT 'info' NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_operating_system" (
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"display_name" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"os_type" text NOT NULL,
	"os_version" text NOT NULL,
	"proxmox_template_id" integer NOT NULL,
	"status" "operating_system_status" DEFAULT 'testing' NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "birdhouse_ssh_key" (
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"fingerprint" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_two_factor" (
	"backup_codes" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_user" (
	"approved" boolean NOT NULL,
	"ban_expires" timestamp,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text DEFAULT 'https://gravatar.com/avatar/HASH',
	"name" text NOT NULL,
	"role" text,
	"two_factor_enabled" boolean DEFAULT false,
	"updated_at" timestamp with time zone,
	CONSTRAINT "birdhouse_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "birdhouse_user_preferences" (
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_verification" (
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updated_at" timestamp with time zone,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_vm" (
	"cpu_cores" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"disk_gb" integer NOT NULL,
	"hostname" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ipv4_address" text NOT NULL,
	"memory_mb" integer NOT NULL,
	"name" text NOT NULL,
	"operating_system_id" text,
	"proxmox_node" text NOT NULL,
	"proxmox_pool" text DEFAULT 'UserPool' NOT NULL,
	"root_password" text NOT NULL,
	"ssh_key_id" text NOT NULL,
	"ssh_public_key" text NOT NULL,
	"status" "vm_status" DEFAULT 'provisioning' NOT NULL,
	"template_id" text,
	"updated_at" timestamp with time zone,
	"user_id" text NOT NULL,
	"vmid" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birdhouse_vm_template" (
	"cpu_cores" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"description" text,
	"disk_gb" integer NOT NULL,
	"display_name" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"memory_mb" integer NOT NULL,
	"name" text NOT NULL,
	"status" "vm_template_status" DEFAULT 'testing' NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "birdhouse_vm_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "birdhouse_account" ADD CONSTRAINT "birdhouse_account_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_audit_log" ADD CONSTRAINT "birdhouse_audit_log_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_notification" ADD CONSTRAINT "birdhouse_notification_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_ssh_key" ADD CONSTRAINT "birdhouse_ssh_key_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_two_factor" ADD CONSTRAINT "birdhouse_two_factor_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_user_preferences" ADD CONSTRAINT "birdhouse_user_preferences_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_vm" ADD CONSTRAINT "birdhouse_vm_ssh_key_id_birdhouse_ssh_key_id_fk" FOREIGN KEY ("ssh_key_id") REFERENCES "public"."birdhouse_ssh_key"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "birdhouse_vm" ADD CONSTRAINT "birdhouse_vm_user_id_birdhouse_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."birdhouse_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "birdhouse_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_userId_idx" ON "birdhouse_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "birdhouse_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_resourceType_idx" ON "birdhouse_audit_log" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "audit_log_createdAt_id_idx" ON "birdhouse_audit_log" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "audit_log_userId_createdAt_id_idx" ON "birdhouse_audit_log" USING btree ("user_id","created_at","id");--> statement-breakpoint
CREATE INDEX "notification_id_idx" ON "birdhouse_notification" USING btree ("id");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "birdhouse_notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_createdAt_idx" ON "birdhouse_notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "operating_system_name_idx" ON "birdhouse_operating_system" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ssh_key_userId_idx" ON "birdhouse_ssh_key" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ssh_key_name_idx" ON "birdhouse_ssh_key" USING btree ("name");--> statement-breakpoint
CREATE INDEX "ssh_key_fingerprint_idx" ON "birdhouse_ssh_key" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "birdhouse_two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "birdhouse_two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "birdhouse_user" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "birdhouse_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_approved_idx" ON "birdhouse_user" USING btree ("approved");--> statement-breakpoint
CREATE INDEX "user_preferences_userId_idx" ON "birdhouse_user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "birdhouse_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "vm_vmid_idx" ON "birdhouse_vm" USING btree ("vmid");--> statement-breakpoint
CREATE INDEX "vm_userId_idx" ON "birdhouse_vm" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vm_sshKeyId_idx" ON "birdhouse_vm" USING btree ("ssh_key_id");--> statement-breakpoint
CREATE INDEX "vm_status_idx" ON "birdhouse_vm" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vm_template_name_idx" ON "birdhouse_vm_template" USING btree ("name");--> statement-breakpoint
CREATE INDEX "vm_template_status_idx" ON "birdhouse_vm_template" USING btree ("status");