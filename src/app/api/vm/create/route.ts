import { getProxmoxClient } from "@/lib/proxmox"
import { waitForTask } from "@/lib/proxmox/wait-for-task"

const DEFAULT_NODE = "pve01"

export async function GET() {
  const proxmox = getProxmoxClient()

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  function send(data: string) {
    return writer.write(encoder.encode(`data: ${data}\n\n`))
  }

  function sendEvent(event: string, data: string) {
    return writer.write(encoder.encode(`event: ${event}\ndata: ${data}\n\n`))
  }

  ;(async () => {
    try {
      await send("Starting VM creation...")

      const cloneUpid = await proxmox.nodes
        .$(DEFAULT_NODE)
        .qemu.$(9000)
        .clone.$post({
          full: false,
          name: "test-vm",
          newid: 5000,
        })

      await send(`Clone task started: ${cloneUpid}`)

      for await (const update of waitForTask(
        proxmox,
        DEFAULT_NODE,
        cloneUpid,
      )) {
        if (update.logs) {
          for (const line of update.logs) {
            if (!line || line === "no content") continue
            await send(line)
          }
        }
      }

      await send("Configuring VM...")

      await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).config.$post({
        cipassword: "cloudpassword",
        ciuser: "clouduser",
        cores: 2,
        memory: "2048",
      })

      await proxmox.nodes.$(DEFAULT_NODE).qemu.$(5000).cloudinit.$put()

      await send("Starting VM...")

      const startUpid = await proxmox.nodes
        .$(DEFAULT_NODE)
        .qemu.$(5000)
        .status.start.$post()

      await send(`Start task started: ${startUpid}`)

      for await (const update of waitForTask(
        proxmox,
        DEFAULT_NODE,
        startUpid,
      )) {
        if (update.logs) {
          for (const line of update.logs) {
            if (!line || line === "no content") continue
            await send(line)
          }
        }
      }

      await send("VM started!")
      await sendEvent("done", "ok")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error during VM creation"
      await sendEvent("error", message)
    } finally {
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  })
}
