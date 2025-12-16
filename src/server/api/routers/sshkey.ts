import { exec } from "node:child_process"
import { promisify } from "node:util"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, lt, or } from "drizzle-orm"
import * as forge from "node-forge"
import z from "zod"

import { createSSHKeySchema } from "@/modules/dashboard/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { sshKey as sshKeyTable } from "@/server/db/schema"

const execAsync = promisify(exec)

export const sshKeyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSSHKeySchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { keyType, name, bits } = input

      const [existingKey] = await ctx.db
        .select()
        .from(sshKeyTable)
        .where(and(eq(sshKeyTable.name, name), eq(sshKeyTable.userId, user.id)))
      if (existingKey) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An SSH key with this name already exists for your account.",
        })
      }

      let privateKeyPEM: string
      let publicKeyOpenSSH: string
      let fingerprint: string

      if (keyType === "rsa") {
        const keypair = forge.pki.rsa.generateKeyPair({
          bits: bits || 2048,
          workers: -1,
        })
        privateKeyPEM = forge.pki.privateKeyToPem(keypair.privateKey)
        publicKeyOpenSSH = forge.ssh.publicKeyToOpenSSH(keypair.publicKey, name)

        const rsaPublicKeyDer = forge.asn1
          .toDer(forge.pki.publicKeyToAsn1(keypair.publicKey))
          .getBytes()
        const md = forge.md.md5.create()
        md.update(rsaPublicKeyDer)
        fingerprint = md.digest().toHex().match(/.{2}/g)?.join(":") || ""
      } else if (keyType === "ed25519") {
        try {
          const tempKeyBase = `/tmp/ssh_key_${crypto.randomUUID()}`
          const tempKeyPath = tempKeyBase
          const tempPubKeyPath = `${tempKeyBase}.pub`

          const command = `ssh-keygen -t ed25519 -f ${tempKeyPath} -q -N "" -C "${name}"`
          await execAsync(command)

          const { stdout: pubKeyOutput } = await execAsync(
            `cat ${tempPubKeyPath}`,
          )
          const { stdout: privKeyOutput } = await execAsync(
            `cat ${tempKeyPath}`,
          )

          const { stdout: fingerprintOutput } = await execAsync(
            `ssh-keygen -lf ${tempPubKeyPath} -E md5`,
          )

          fingerprint =
            fingerprintOutput.split(" ")[1]?.replace("MD5:", "").trim() || ""

          await execAsync(`rm ${tempKeyPath} ${tempPubKeyPath}`)

          privateKeyPEM = privKeyOutput.trim()
          publicKeyOpenSSH = pubKeyOutput.trim()
        } catch (error) {
          console.error("Error generating Ed25519 key with ssh-keygen:", error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to generate Ed25519 SSH key: ${
              (error as Error).message
            }`,
          })
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unsupported key type provided.",
        })
      }

      const [newKey] = await ctx.db
        .insert(sshKeyTable)
        .values({
          fingerprint,
          name,
          publicKey: publicKeyOpenSSH,
          userId: user.id,
        })
        .returning()

      return {
        ...newKey,
        privateKey: privateKeyPEM,
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.cuid(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { cursor, limit } = input

      const sshKeys = await ctx.db
        .select()
        .from(sshKeyTable)
        .where(
          and(
            eq(sshKeyTable.userId, user.id),
            cursor
              ? or(
                  lt(sshKeyTable.createdAt, cursor.createdAt),
                  and(
                    eq(sshKeyTable.id, cursor.id),
                    eq(sshKeyTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(sshKeyTable.createdAt))
        .limit(limit + 1)

      const hasMore = sshKeys.length > limit
      const items = hasMore ? sshKeys.slice(0, -1) : sshKeys
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            createdAt: lastItem.createdAt,
            id: lastItem.id,
          }
        : null

      return {
        items,
        nextCursor,
      }
    }),
})
