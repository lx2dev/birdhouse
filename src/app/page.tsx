import { createVmAction } from "@/actions/vm/create"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-semibold text-lg">Birdhouse</h1>

      <form action={createVmAction}>
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          type="submit"
        >
          Create VM
        </button>
      </form>
    </div>
  )
}
