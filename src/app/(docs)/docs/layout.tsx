import { DocsLayout as FumadocsLayout } from "fumadocs-ui/layouts/notebook"

import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <FumadocsLayout {...baseOptions()} tree={source.getPageTree()}>
      {children}
    </FumadocsLayout>
  )
}
