import { createFileRoute } from '@tanstack/react-router'
import { authMiddleware } from '@/lib/auth-middleware'
import {
  getCurrentUserId,
  createBookingSession,
  type CreateBookingData,
} from '@/lib/server/booking-service'

export const Route = createFileRoute('/api/booking/create')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      POST: async ({ request }) => {
        const userId = await getCurrentUserId()
        const data = await request.json() as CreateBookingData

        if (!data.session?.title || !data.session?.description || !data.session?.type) {
          return new Response(
            JSON.stringify({ error: 'Missing required session fields' }),
            { status: 400 }
          )
        }

        if (!['FREE', 'PAID', 'COMMITMENT'].includes(data.session.type)) {
          return new Response(
            JSON.stringify({ error: 'Invalid booking type' }),
            { status: 400 }
          )
        }

        if (data.session.type !== 'FREE') {
          if (!data.session.token || !data.session.price) {
            return new Response(
              JSON.stringify({ error: 'Token and price are required for paid sessions' }),
              { status: 400 }
            )
          }
        }

        if (![15, 30, 45].includes(data.session.duration)) {
          return new Response(
            JSON.stringify({ error: 'Invalid duration. Must be 15, 30, or 45 minutes' }),
            { status: 400 }
          )
        }

        if (![5, 10, 15].includes(data.session.timeBreak)) {
          return new Response(
            JSON.stringify({ error: 'Invalid time break. Must be 5, 10, or 15 minutes' }),
            { status: 400 }
          )
        }

        if (data.availability && data.availability.length > 0) {
          for (const avail of data.availability) {
            if (avail.dayOfWeek < 0 || avail.dayOfWeek > 6) {
              return new Response(
                JSON.stringify({ error: 'Invalid day of week. Must be 0-6' }),
                { status: 400 }
              )
            }

            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!timeRegex.test(avail.startTime) || !timeRegex.test(avail.endTime)) {
              return new Response(
                JSON.stringify({ error: 'Invalid time format. Must be HH:MM (24-hour)' }),
                { status: 400 }
              )
            }

            if (avail.startTime >= avail.endTime) {
              return new Response(
                JSON.stringify({ error: 'Start time must be before end time' }),
                { status: 400 }
              )
            }

            if (![15, 30, 45].includes(avail.duration)) {
              return new Response(
                JSON.stringify({ error: 'Invalid availability duration. Must be 15, 30, or 45 minutes' }),
                { status: 400 }
              )
            }

            if (![5, 10, 15].includes(avail.timeBreak)) {
              return new Response(
                JSON.stringify({ error: 'Invalid availability time break. Must be 5, 10, or 15 minutes' }),
                { status: 400 }
              )
            }
          }
        }

        const session = await createBookingSession(userId, data)

        return new Response(JSON.stringify(session), { status: 201 })
      },
    }
  }
})
