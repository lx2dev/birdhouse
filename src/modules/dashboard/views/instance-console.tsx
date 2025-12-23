import { InstanceConsole } from "@/modules/dashboard/sections/instance/console"

export default function InstanceConsoleView({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <InstanceConsole id={id} />
    </div>
  )
}
