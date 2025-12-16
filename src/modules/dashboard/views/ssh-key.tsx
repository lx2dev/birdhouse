import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { SSHKeySection } from "@/modules/dashboard/sections/ssh-key"
import { CreateSSHKeyDialog } from "@/modules/dashboard/ui/create-ssh-key-dialog"

export function SSHKeyView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">SSH Keys</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your SSH keys for server access
          </p>
        </div>
        <CreateSSHKeyDialog>
          <Button>
            <IconPlus />
            Add SSH Key
          </Button>
        </CreateSSHKeyDialog>
      </div>
      <SSHKeySection />
    </div>
  )
}
