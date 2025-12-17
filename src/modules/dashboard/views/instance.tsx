import { InstanceSection } from "@/modules/dashboard/sections/instance"

export function InstanceView({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <InstanceSection id={id} />
    </div>
  )
}
