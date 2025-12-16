export default async function ComputePage({
  params,
}: PageProps<"/dashboard/compute/[id]">) {
  const { id } = await params

  return (
    <div>
      <h1>ComputePage</h1>

      <p>VM ID: {id}</p>
    </div>
  )
}
