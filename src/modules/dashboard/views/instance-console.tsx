import { InstanceConsole } from "@/modules/dashboard/sections/instance/console"

export default function InstanceConsoleView({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <InstanceConsole id={id} />
    </div>
  )
}
