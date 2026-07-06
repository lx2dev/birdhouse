export default function Layout({ children }: LayoutProps<"/auth">) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--muted)_0%,transparent_20%,transparent_80%,var(--muted)_100%)] opacity-35" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[42px_42px] opacity-45" />

      <main>{children}</main>
    </div>
  )
}
