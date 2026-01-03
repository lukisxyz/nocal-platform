import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import { getCurrentUserId, getProfile, upsertProfile } from '@/lib/server/profile-service'

export const Route = createFileRoute('/api/profile')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => {
        const userId = await getCurrentUserId()
        const profile = await getProfile(userId)

        return new Response(JSON.stringify(profile[0] || null));
      },
      PUT: async ({ request }) => {
        const userId = await getCurrentUserId()
        const data = await request.json()

        const profile = await upsertProfile(userId, data)

        return new Response(JSON.stringify(profile));
      },
    }
  }
});
