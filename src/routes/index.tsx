import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-gray-300 text-lg">
          Start building your application here. This is a clean TanStack Start project.
        </p>
      </div>
    </div>
  )
}
