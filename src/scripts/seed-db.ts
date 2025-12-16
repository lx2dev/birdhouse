import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

const SEED_TEMPLATES = [
  {
    cpuCores: 2,
    description: "Official Ubuntu 22.04 LTS server image.",
    diskGb: 20,
    displayName: "Ubuntu 22.04 LTS",
    memoryMb: 2048,
    name: "Ubuntu 22.04 LTS",
    proxmoxTemplateId: 9000,
    status: "available",
  },
  {
    cpuCores: 4,
    description: "Official CentOS 8 server image.",
    diskGb: 25,
    displayName: "CentOS 8",
    memoryMb: 4096,
    name: "CentOS 8",
    proxmoxTemplateId: 9001,
    status: "available",
  },
  {
    cpuCores: 2,
    description: "Official Windows Server 2019 image.",
    diskGb: 40,
    displayName: "Windows Server 2019",
    memoryMb: 8192,
    name: "Windows Server 2019",
    proxmoxTemplateId: 9002,
    status: "available",
  },
  {
    cpuCores: 1,
    description: "Lightweight Alpine Linux image.",
    diskGb: 10,
    displayName: "Alpine Linux",
    memoryMb: 1024,
    name: "Alpine Linux",
    proxmoxTemplateId: 9003,
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
//         status: "running",
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
