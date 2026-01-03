import { useQuery } from '@tanstack/react-query'

export interface BookingSession {
  id: string
  mentorId: string
  title: string
  description: string
  type: 'FREE' | 'PAID' | 'COMMITMENT'
  token: string | null
  price: string | null
  duration: number
  timeBreak: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  availability?: Availability[]
}

export interface Availability {
  id: string
  mentorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  duration: number
  timeBreak: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function useBookingSessions() {
  return useQuery<BookingSession[]>({
    queryKey: ['booking-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/booking', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch booking sessions')
      }

      return response.json()
    },
  })
}

export function useBookingSession(sessionId: string) {
  return useQuery<BookingSession | null>({
    queryKey: ['booking-session', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/booking/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Failed to fetch booking session')
      }

      return response.json()
    },
    enabled: !!sessionId,
  })
}
