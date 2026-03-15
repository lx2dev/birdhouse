import type { Options } from "@node-rs/argon2"
import { hash, verify } from "@node-rs/argon2"

const opts: Options = {
  algorithm: 2,
  memoryCost: 65536,
  outputLen: 32,
  parallelism: 4,
  timeCost: 3,
}

export async function hashPassword(password: string) {
  const res = await hash(password, opts)
  return res
}

export async function verifyPassword(data: { password: string; hash: string }) {
  const { password, hash } = data
  const res = await verify(hash, password, opts)
  return res
}
