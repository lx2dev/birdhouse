import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

import "./src/env"

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

const withMDX = createMDX({
  // MDX config
})

export default withMDX(nextConfig)
