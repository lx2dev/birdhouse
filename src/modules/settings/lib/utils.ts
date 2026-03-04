import type { TrustedSocialProvider } from "@/constants"

export function formatProviderName(provider: TrustedSocialProvider) {
  switch (provider) {
    case "github":
      return "GitHub"
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}
