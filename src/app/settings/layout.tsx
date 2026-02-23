import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { api, HydrateClient } from "@/lib/api/server"
import { SettingsHeader } from "@/modules/settings/ui/settings-header"
import { SettingsSidebar } from "@/modules/settings/ui/settings-sidebar"

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  void api.account.getProfile.prefetch()

  return (
    <HydrateClient>
      <div className="min-h-svh">
        <SidebarProvider
          style={
            {
              "--header-height": "calc(var(--spacing) * 12)",
              "--sidebar-width": "calc(var(--spacing) * 74)",
            } as React.CSSProperties
          }
        >
          <SettingsSidebar />
          <SidebarInset>
            <SettingsHeader />
            <main className="size-full p-4 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </HydrateClient>
  )
}
