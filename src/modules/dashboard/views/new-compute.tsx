import { NewComputeSection } from "@/modules/dashboard/sections/new-compute"

export function NewComputeView() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Create Instance</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a template and configure your virtual machine
        </p>
      </div>
      <NewComputeSection />
    </div>
  )
}
