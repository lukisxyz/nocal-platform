import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import {
  getCurrentUserId,
  getMentorProfileId,
  getBookingSessions,
} from '@/lib/server/booking-service'

export const Route = createFileRoute('/api/booking')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async () => {
        const userId = await getCurrentUserId()
        const mentorId = await getMentorProfileId(userId)
        const sessions = await getBookingSessions(mentorId)

        return new Response(JSON.stringify(sessions))
      },
    }
  }
})
