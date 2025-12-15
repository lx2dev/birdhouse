import { CreateTemplateDialog } from "@/modules/admin/ui/create-template-dialog"

export function TemplateView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">VM Templates</h1>
          <p className="text-muted-foreground">
            Manage compute templates for virtual machine provisioning
          </p>
        </div>
        <CreateTemplateDialog />
      </div>
    </div>
  )
}
