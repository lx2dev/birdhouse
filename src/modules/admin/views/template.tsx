import { TemplateSection } from "@/modules/admin/sections/template"
import { CreateTemplateDialog } from "@/modules/admin/ui/create-template-dialog"

export function TemplateView() {
  return (
    <div className="@container space-y-6">
      <div className="flex @md:flex-row flex-col items-start @md:items-center @md:justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">VM Templates</h1>
          <p className="text-muted-foreground">
            Manage compute templates for virtual machine provisioning
          </p>
        </div>
        <CreateTemplateDialog />
      </div>
      <TemplateSection />
    </div>
  )
}
