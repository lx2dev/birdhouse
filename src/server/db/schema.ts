import { sql } from "drizzle-orm"
import { index, pgEnum, pgTableCreator } from "drizzle-orm/pg-core"

export const createTable = pgTableCreator((name) => `birdhouse_${name}`)

export const vmTemplateStatusEnum = pgEnum("vm_template_status", [
  "available",
  "unavailable",
  "testing",
])

export const vmTemplate = createTable(
  "vm_template",
  (d) => ({
    cpuCores: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    description: d.text(),
    diskGb: d.integer().notNull(),
    displayName: d.text().notNull(),
    id: d.text().primaryKey(),
    memoryMb: d.integer().notNull(),
    name: d.text().notNull().unique(),
    osType: d.text().notNull(),
    proxmoxTemplateId: d.text().notNull(),
    status: vmTemplateStatusEnum().default("testing").notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("vm_template_name_idx").on(t.name),
    index("vm_template_status_idx").on(t.status),
  ],
)

export const vmStatusEnum = pgEnum("vm_status", [
  "running",
  "stopped",
  "provisioning",
  "suspended",
  "error",
])

export const vm = createTable(
  "vm",
  (d) => ({
    cpuCores: d.integer().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    diskGb: d.integer().notNull(),
    hostname: d.text().notNull(),
    id: d.text().primaryKey(),
    ipv4Address: d.text().notNull(),
    ipv6Address: d.text().notNull(),
    proxmoxNode: d.text().notNull(),
    proxmoxPool: d.text().default("").notNull(),
    ramMb: d.integer().notNull(),
    rootPassword: d.text().notNull(),
    sshPublicKey: d.text().notNull(),
    status: vmStatusEnum().default("provisioning").notNull(),
    templateId: d
      .text()
      .notNull()
      .references(() => vmTemplate.id),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vmid: d.text().notNull(),
  }),
  (t) => [
    index("vm_vmid_idx").on(t.vmid),
    index("vm_userId_idx").on(t.userId),
    index("vm_status_idx").on(t.status),
  ],
)

export const sshKey = createTable(
  "ssh_key",
  (d) => ({
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    fingerprint: d.text().notNull(),
    id: d.text().primaryKey(),
    name: d.text().notNull(),
    publicKey: d.text().notNull(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("ssh_key_userId_idx").on(t.userId)],
)

export const auditLog = createTable(
  "audit_log",
  (d) => ({
    action: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    details: d.jsonb().notNull(),
    id: d.text().primaryKey(),
    ipAddress: d.text(),
    resourceId: d.text().notNull(),
    resourceType: d.text().notNull(),
    userId: d
      .text()
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
      .boolean()
      .$defaultFn(() => false)
      .notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    email: d.text().notNull().unique(),
    emailVerified: d
      .boolean()
      .$defaultFn(() => false)
      .notNull(),
    id: d.text().primaryKey(),
    image: d.text(),
    name: d.text().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
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
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp().notNull(),
    id: d.text().primaryKey(),
    ipAddress: d.text(),
    token: d.text().notNull().unique(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    userAgent: d.text(),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const account = createTable(
  "account",
  (d) => ({
    accessToken: d.text(),
    accessTokenExpiresAt: d.timestamp(),
    accountId: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    id: d.text().primaryKey(),
    idToken: d.text(),
    password: d.text(),
    providerId: d.text().notNull(),
    refreshToken: d.text(),
    refreshTokenExpiresAt: d.timestamp(),
    scope: d.text(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    userId: d
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (t) => [index("account_userId_idx").on(t.userId)],
)

export const verification = createTable(
  "verification",
  (d) => ({
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp().notNull(),
    id: d.text().primaryKey(),
    identifier: d.text().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    value: d.text().notNull(),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
)
