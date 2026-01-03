import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { deleteAccount, getCurrentUser, getCurrentUserId } from '@/lib/server/account-service'

export const Route = createFileRoute('/api/account')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => {
        const userId = await getCurrentUserId()
        const user = await getCurrentUser(userId)

        return new Response(JSON.stringify(user));
      },
      DELETE: async () => {
        const userId = await getCurrentUserId()
        const result = await deleteAccount(userId)

        return new Response(JSON.stringify(result), { status: 200 });
      },
    }
  }
});
