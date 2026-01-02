import { createFileRoute } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  return <Outlet />
}
