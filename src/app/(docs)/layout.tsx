import { RootProvider } from "fumadocs-ui/provider/next"

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <RootProvider>{children}</RootProvider>
    </div>
  )
}
