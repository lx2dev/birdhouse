import { db } from "@/server/db"
import * as schema from "@/server/db/schema"

async function seedVMTemplates() {
  try {
    console.log("Seeding VM templates...")
    await db
      .insert(schema.vmTemplate)
      .values({
        cpuCores: 2,
        description: "Official Ubuntu 22.04 LTS server image.",
        diskGb: 20,
        displayName: "Ubuntu 22.04 LTS",
        id: "template-ubuntu-2204",
        memoryMb: 2048,
        name: "Ubuntu 22.04 LTS",
        osType: "linux",
        proxmoxTemplateId: "9000",
        status: "available",
      })
      .onConflictDoNothing()
      .execute()
  } catch (error) {
    console.error("Error seeding VM templates:", error)
    process.exit(1)
  }
}

async function seedVM() {
  try {
    console.log("Seeding VMs...")
    await db
      .insert(schema.vm)
      .values({
        cpuCores: 2,
        diskGb: 20,
        hostname: "vm-ubuntu-2204",
        id: "vm-001",
        ipv4Address: "10.0.100.1",
        memoryMb: 2048,
        name: "Ubuntu VM 1",
        proxmoxNode: "node1",
        rootPassword: "securepassword",
        sshPublicKey: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...",
        status: "running",
        templateId: "template-ubuntu-2204",
        userId: "13EKN93ccV5sDwqAZWE05tjc0aaiZjZM",
        vmid: 100,
      })
      .onConflictDoNothing()
      .execute()
  } catch (error) {
    console.error("Error seeding VMs:", error)
    process.exit(1)
  }
}

async function main() {
  await seedVMTemplates()
  await seedVM()
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
