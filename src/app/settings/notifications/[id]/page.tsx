export default async function NotificationPage({
  params,
}: PageProps<"/settings/notifications/[id]">) {
  const { id } = await params

  return (
    <div>
      <h1>NotificationPage</h1>
      <p>Notification ID: {id}</p>
    </div>
  )
}
