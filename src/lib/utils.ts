import type { Options } from "@node-rs/argon2"
import { hash } from "@node-rs/argon2"
import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
