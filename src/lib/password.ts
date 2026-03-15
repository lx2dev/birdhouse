import type { Options } from "@node-rs/argon2"
import { hash } from "@node-rs/argon2"

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
