import type { TRUSTED_SOCIAL_PROVIDERS } from "@/constants"

export function formatProviderName(
  provider: (typeof TRUSTED_SOCIAL_PROVIDERS)[number],
) {
  switch (provider) {
    case "github":
      return "GitHub"
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}
