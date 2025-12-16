import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

const SEED_TEMPLATES: readonly (typeof schema.vmTemplate.$inferInsert)[] = [
  {
    cpuCores: 1,
    description: "Basic template with 1 CPU core, 1GB RAM, and 10GB disk.",
    diskGb: 10,
    displayName: "Standard Micro",
    memoryMb: 1024,
    name: "Standard Micro",
    status: "available",
  },
  {
    cpuCores: 2,
    description: "Basic template with 2 CPU cores, 2GB RAM, and 20GB disk.",
    diskGb: 20,
    displayName: "Standard Small",
    memoryMb: 2048,
    name: "Standard Small",
    status: "available",
  },
  {
    cpuCores: 4,
    description: "Basic template with 4 CPU cores, 4GB RAM, and 40GB disk.",
    diskGb: 40,
    displayName: "Standard Medium",
    memoryMb: 4096,
    name: "Standard Medium",
    status: "available",
  },
  {
    cpuCores: 8,
    description: "Basic template with 8 CPU cores, 8GB RAM, and 80GB disk.",
    diskGb: 80,
    displayName: "Standard Large",
    memoryMb: 8192,
    name: "Standard Large",
    status: "available",
  },
] as const

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

// async function seedVM() {
//   try {
//     console.log("Seeding VMs...")
//     await db
//       .insert(schema.vm)
//       .values({
//         cpuCores: 2,
//         diskGb: 20,
//         hostname: "vm-ubuntu-2204",
//         ipv4Address: "10.0.100.1",
//         memoryMb: 2048,
//         name: "Ubuntu VM 1",
//         proxmoxNode: "node1",
//         rootPassword: "securepassword",
//         sshPublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...",
//         status: "provisioning",
//         templateId: vmTemplateId,
//         userId: "13EKN93ccV5sDwqAZWE05tjc0aaiZjZM",
//         vmid: 100,
//       })
//       .onConflictDoNothing()
//       .execute()
//   } catch (error) {
//     console.error("Error seeding VMs:", error)
//     process.exit(1)
//   }
// }

async function main() {
  await seedVMTemplates()
  // await seedVM()
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
