import type { KeyObject } from "node:crypto"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, ilike, lt, or } from "drizzle-orm"
import forge from "node-forge"
import z from "zod"

import { createSSHKeySchema } from "@/modules/dashboard/schemas"
import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { sshKey as sshKeyTable } from "@/server/db/schema"

function bufferToLengthEncoded(buf: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(buf.length)
  return Buffer.concat([len, buf])
}

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
        const keypair = await new Promise<forge.pki.KeyPair>(
          (resolve, reject) => {
            forge.pki.rsa.generateKeyPair(
              { bits: bits || 2048, workers: -1 },
              (err, keypair) => {
                if (err) reject(err)
                else resolve(keypair)
              },
            )
          },
        )

        privateKeyPEM = forge.pki.privateKeyToPem(keypair.privateKey)
        publicKeyOpenSSH = forge.ssh.publicKeyToOpenSSH(
          keypair.publicKey as forge.pki.rsa.PublicKey,
          name,
        )
        fingerprint = forge.ssh.getPublicKeyFingerprint(
          keypair.publicKey as forge.pki.rsa.PublicKey,
          {
            delimiter: ":",
            encoding: "hex",
          },
        ) as string
      } else if (keyType === "ed25519") {
        const { createHash, generateKeyPair } = await import("node:crypto")

        const { publicKey, privateKey } = await new Promise<{
          publicKey: KeyObject
          privateKey: KeyObject
        }>((resolve, reject) => {
          generateKeyPair("ed25519", {}, (err, publicKey, privateKey) => {
            if (err) reject(err)
            else resolve({ privateKey, publicKey })
          })
        })

        privateKeyPEM = privateKey.export({
          format: "pem",
          type: "pkcs8",
        }) as string

        const jwk = publicKey.export({ format: "jwk" })
        if (!jwk.x) throw new Error("Invalid JWK")

        const pubKeyBytes = Buffer.from(jwk.x, "base64url")

        const sshKeyType = Buffer.from("ssh-ed25519")
        const blob = Buffer.concat([
          bufferToLengthEncoded(sshKeyType),
          bufferToLengthEncoded(pubKeyBytes),
        ])

        const base64 = blob.toString("base64")
        publicKeyOpenSSH = `ssh-ed25519 ${base64} ${name}`

        const md5 = createHash("md5").update(blob).digest("hex")
        fingerprint = md5.match(/.{2}/g)?.join(":") || ""
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

  delete: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id } = input

      const [key] = await ctx.db
        .delete(sshKeyTable)
        .where(and(eq(sshKeyTable.id, id), eq(sshKeyTable.userId, user.id)))
        .returning()

      if (!key) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "SSH key not found.",
        })
      }

      return {
        keyId: key.id,
      }
    }),

  list: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.uuid(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
        query: z.string().min(1).max(200).nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { cursor, limit, query } = input

      const sshKeys = await ctx.db
        .select()
        .from(sshKeyTable)
        .where(
          and(
            eq(sshKeyTable.userId, user.id),
            query
              ? or(
                  ilike(sshKeyTable.name, `%${query}%`),
                  ilike(sshKeyTable.fingerprint, `%${query}%`),
                )
              : undefined,
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { id, name } = input

      const [existing] = await ctx.db
        .select()
        .from(sshKeyTable)
        .where(and(eq(sshKeyTable.name, name), eq(sshKeyTable.userId, user.id)))

      if (existing && existing.id !== id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An SSH key with this name already exists for your account.",
        })
      }

      const [updated] = await ctx.db
        .update(sshKeyTable)
        .set({ name })
        .where(and(eq(sshKeyTable.id, id), eq(sshKeyTable.userId, user.id)))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "SSH key not found.",
        })
      }

      return updated
    }),
})
