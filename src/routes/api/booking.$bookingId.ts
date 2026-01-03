import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import {
  getCurrentUserId,
  getMentorProfileId,
  getBookingSessionWithAvailability,
  updateBookingSession,
  deleteBookingSession,
  type UpdateBookingData,
} from '@/lib/server/booking-service'

export const Route = createFileRoute('/api/booking/$bookingId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ params }) => {
        const userId = await getCurrentUserId()
        const mentorId = await getMentorProfileId(userId)
        const session = await getBookingSessionWithAvailability(params.bookingId, mentorId)

        if (!session) {
          return new Response(
            JSON.stringify({ error: 'Booking session not found' }),
            { status: 404 }
          )
        }

        return new Response(JSON.stringify(session))
      },
      PUT: async ({ params, request }) => {
        const userId = await getCurrentUserId()
        const data = await request.json() as UpdateBookingData

        try {
          const session = await updateBookingSession(userId, params.bookingId, data)
          return new Response(JSON.stringify(session))
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('unauthorized')) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 404 }
              )
            }
          }

          return new Response(
            JSON.stringify({ error: 'Failed to update booking session' }),
            { status: 500 }
          )
        }
      },
      DELETE: async ({ params }) => {
        const userId = await getCurrentUserId()

        try {
          await deleteBookingSession(userId, params.bookingId)
          return new Response(JSON.stringify({ success: true }))
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('unauthorized')) {
              return new Response(
                JSON.stringify({ error: error.message }),
                { status: 404 }
              )
            }
          }

          return new Response(
            JSON.stringify({ error: 'Failed to delete booking session' }),
            { status: 500 }
          )
        }
      },
    }
  }
})
