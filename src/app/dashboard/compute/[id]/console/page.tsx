export default async function InstanceConsolePage({
  params,
}: PageProps<"/dashboard/compute/[id]/console">) {
  const { id } = await params

  return (
    <div>
      <h1>InstanceConsolePage</h1>

      <p>{id}</p>
    </div>
  )
}
