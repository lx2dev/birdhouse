import { hashPassword } from "@/lib/utils"
import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

const SEED_USERS: readonly (typeof schema.user.$inferInsert)[] = [
  {
    approved: true,
    email: "test@birdhouselabs.app",
    emailVerified: true,
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test User",
    role: "user",
  },
  {
    approved: true,
    email: "admin@birdhouselabs.app",
    emailVerified: true,
    id: "00000000-0000-0000-0000-000000000002",
    name: "Admin User",
    role: "admin",
  },
]

const demoPassword = "password123"
const password = await hashPassword(demoPassword)

const SEED_ACCOUNTS: readonly (typeof schema.account.$inferInsert)[] = [
  {
    accountId: "00000000-0000-0000-0000-000000000111",
    id: "00000000-0000-0000-0000-000000000011",
    password,
    providerId: "credential",
    userId: "00000000-0000-0000-0000-000000000001",
  },
  {
    accountId: "00000000-0000-0000-0000-000000000222",
    id: "00000000-0000-0000-0000-000000000022",
    password,
    providerId: "credential",
    userId: "00000000-0000-0000-0000-000000000002",
  },
]

const SEED_TEMPLATES: readonly (typeof schema.vmTemplate.$inferInsert)[] = [
  {
    cpuCores: 1,
    description: "Basic template with 1 CPU core, 1GB RAM, and 10GB disk.",
    diskGb: 10,
    displayName: "Standard Micro",
    memoryMb: 1024,
    name: "standard-micro",
    status: "available",
  },
  {
    cpuCores: 2,
    description: "Basic template with 2 CPU cores, 2GB RAM, and 20GB disk.",
    diskGb: 20,
    displayName: "Standard Small",
    memoryMb: 2048,
    name: "standard-small",
    status: "available",
  },
  {
    cpuCores: 4,
    description: "Basic template with 4 CPU cores, 4GB RAM, and 40GB disk.",
    diskGb: 40,
    displayName: "Standard Medium",
    memoryMb: 4096,
    name: "standard-medium",
    status: "available",
  },
  {
    cpuCores: 8,
    description: "Basic template with 8 CPU cores, 8GB RAM, and 80GB disk.",
    diskGb: 80,
    displayName: "Standard Large",
    memoryMb: 8192,
    name: "standard-large",
    status: "available",
  },
] as const

const OPERATING_SYSTEMS: readonly (typeof schema.operatingSystem.$inferInsert)[] =
  [
    {
      displayName: "Ubuntu",
      name: "ubuntu",
      osType: "linux",
      osVersion: "22.04 LTS",
      proxmoxTemplateId: 9000,
      status: "available",
    },
    {
      displayName: "Debian",
      name: "debian",
      osType: "linux",
      osVersion: "12",
      proxmoxTemplateId: 9001,
      status: "unavailable",
    },
    {
      displayName: "CentOS",
      name: "centos",
      osType: "linux",
      osVersion: "8",
      proxmoxTemplateId: 9002,
      status: "unavailable",
    },
    {
      displayName: "Windows Server",
      name: "windows-server",
      osType: "windows",
      osVersion: "2022",
      proxmoxTemplateId: 9100,
      status: "unavailable",
    },
  ]

async function seedUsers() {
  try {
    console.log("Seeding users...")
    for (const user of SEED_USERS) {
      await db.insert(schema.user).values(user).onConflictDoNothing().execute()
    }
  } catch (error) {
    console.error("Error seeding users:", error)
    process.exit(1)
  }
}

async function seedAccounts() {
  try {
    console.log("Seeding accounts...")
    for (const account of SEED_ACCOUNTS) {
      await db
        .insert(schema.account)
        .values(account)
        .onConflictDoNothing()
        .execute()
    }
  } catch (error) {
    console.error("Error seeding accounts:", error)
    process.exit(1)
  }
}

async function seedVMTemplates() {
  try {
    console.log("Seeding VM templates...")
    for (const template of SEED_TEMPLATES) {
      await db
        .insert(schema.vmTemplate)
        .values(template)
        .onConflictDoNothing()
        .execute()
    }
  } catch (error) {
    console.error("Error seeding VM templates:", error)
    process.exit(1)
  }
}

async function seedOperatingSystems() {
  try {
    console.log("Seeding Operating Systems...")
    for (const os of OPERATING_SYSTEMS) {
      await db
        .insert(schema.operatingSystem)
        .values(os)
        .onConflictDoNothing()
        .execute()
    }
  } catch (error) {
    console.error("Error seeding Operating Systems:", error)
    process.exit(1)
  }
}

async function main() {
  await seedUsers()
  await seedAccounts()
  await seedVMTemplates()
  await seedOperatingSystems()
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
