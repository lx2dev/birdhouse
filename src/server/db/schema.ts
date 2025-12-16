import { relations, sql } from "drizzle-orm"
import { index, pgEnum, pgTableCreator } from "drizzle-orm/pg-core"

export const createTable = pgTableCreator((name) => `birdhouse_${name}`)

export const vmTemplateStatusEnum = pgEnum("vm_template_status", [
  "available",
  "unavailable",
  "testing",
])

export type VMTemplateStatus = (typeof vmTemplateStatusEnum.enumValues)[number]

export const vmTemplate = createTable(
  "vm_template",
  (d) => ({
    cpuCores: d.integer("cpu_cores").notNull(),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    description: d.text("description"),
    diskGb: d.integer("disk_gb").notNull(),
    displayName: d.text("display_name").notNull(),
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    memoryMb: d.integer("memory_mb").notNull(),
    name: d.text("name").notNull().unique(),
    proxmoxTemplateId: d.integer("proxmox_template_id").notNull().unique(),
    status: vmTemplateStatusEnum().default("testing").notNull(),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  }),
  (t) => [
    index("vm_template_name_idx").on(t.name),
    index("vm_template_status_idx").on(t.status),
  ],
)

export type VMTemplateTable = typeof vmTemplate.$inferSelect

export const vmStatusEnum = pgEnum("vm_status", [
  "running",
  "stopped",
  "provisioning",
  "suspended",
  "error",
])

export type VMStatus = (typeof vmStatusEnum.enumValues)[number]

export const vm = createTable(
  "vm",
  (d) => ({
    cpuCores: d.integer("cpu_cores").notNull(),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    diskGb: d.integer("disk_gb").notNull(),
    hostname: d.text("hostname").notNull(),
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ipv4Address: d.text("ipv4_address").notNull(),
    memoryMb: d.integer("memory_mb").notNull(),
    name: d.text("name").notNull(),
    proxmoxNode: d.text("proxmox_node").notNull(),
    proxmoxPool: d.text("proxmox_pool").default("UserPool").notNull(),
    rootPassword: d.text("root_password").notNull(),
    sshKeyId: d
      .text("ssh_key_id")
      .notNull()
      .references(() => sshKey.id, { onDelete: "restrict" }),
    sshPublicKey: d.text("ssh_public_key").notNull(),
    status: vmStatusEnum("status").default("provisioning").notNull(),
    templateId: d.text("template_id"),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vmid: d.integer("vmid").notNull(),
  }),
  (t) => [
    index("vm_vmid_idx").on(t.vmid),
    index("vm_userId_idx").on(t.userId),
    index("vm_sshKeyId_idx").on(t.sshKeyId),
    index("vm_status_idx").on(t.status),
  ],
)

export type VMTable = typeof vm.$inferSelect

export const sshKey = createTable(
  "ssh_key",
  (d) => ({
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    fingerprint: d.text("fingerprint").notNull(),
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text("name").notNull(),
    publicKey: d.text("public_key").notNull(),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [
    index("ssh_key_userId_idx").on(t.userId),
    index("ssh_key_name_idx").on(t.name),
    index("ssh_key_fingerprint_idx").on(t.fingerprint),
  ],
)

export type SSHKeyTable = typeof sshKey.$inferSelect

export const auditLog = createTable(
  "audit_log",
  (d) => ({
    action: d.text("action").notNull(),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    details: d.jsonb("details").notNull(),
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ipAddress: d.text("ip_address"),
    resourceId: d.text("resource_id").notNull(),
    resourceType: d.text("resource_type").notNull(),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [
    index("audit_log_userId_idx").on(t.userId),
    index("audit_log_createdAt_idx").on(t.createdAt),
  ],
)

export const user = createTable(
  "user",
  (d) => ({
    approved: d
      .boolean("approved")
      .$defaultFn(() => false)
      .notNull(),
    banExpires: d.timestamp("ban_expires"),
    banned: d.boolean("banned").default(false),
    banReason: d.text("ban_reason"),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    email: d.text("email").notNull().unique(),
    emailVerified: d
      .boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    id: d.text().primaryKey(),
    image: d.text(),
    name: d.text().notNull(),
    role: d.text("role"),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  }),
  (t) => [
    index("user_name_idx").on(t.name),
    index("user_email_idx").on(t.email),
    index("user_approved_idx").on(t.approved),
  ],
)

export const session = createTable(
  "session",
  (d) => ({
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
    id: d.text("id").primaryKey(),
    impersonatedBy: d.text("impersonated_by"),
    ipAddress: d.text("ip_address"),
    token: d.text("token").notNull().unique(),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userAgent: d.text("user_agent"),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const account = createTable(
  "account",
  (d) => ({
    accessToken: d.text("access_token"),
    accessTokenExpiresAt: d.timestamp("access_token_expires_at"),
    accountId: d.text("account_id").notNull(),
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    id: d.text("id").primaryKey(),
    idToken: d.text("id_token"),
    password: d.text("password"),
    providerId: d.text("provider_id").notNull(),
    refreshToken: d.text("refresh_token"),
    refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at"),
    scope: d.text("scope"),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    userId: d
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("account_userId_idx").on(t.userId)],
)

export const verification = createTable(
  "verification",
  (d) => ({
    createdAt: d
      .timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp("expires_at").notNull(),
    id: d.text("id").primaryKey(),
    identifier: d.text("identifier").notNull(),
    updatedAt: d
      .timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date()),
    value: d.text("value").notNull(),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const vmRelations = relations(vm, ({ one }) => ({
  sshKey: one(sshKey, {
    fields: [vm.sshKeyId],
    references: [sshKey.id],
  }),
  user: one(user, {
    fields: [vm.userId],
    references: [user.id],
  }),
}))

export const sshKeyRelations = relations(sshKey, ({ many }) => ({
  vms: many(vm),
}))
