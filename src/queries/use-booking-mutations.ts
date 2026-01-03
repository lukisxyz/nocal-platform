import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { BookingSession } from './use-booking-sessions'

export interface CreateBookingData {
  session: {
    title: string
    description: string
    type: 'FREE' | 'PAID' | 'COMMITMENT'
    token?: string
    price?: string
    duration: number
    timeBreak: number
  }
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
    duration: number
    timeBreak: number
  }[]
}

export interface UpdateBookingData {
  session?: {
    title?: string
    description?: string
    type?: 'FREE' | 'PAID' | 'COMMITMENT'
    token?: string
    price?: string
    duration?: number
    timeBreak?: number
    isActive?: boolean
  }
  availability?: {
    dayOfWeek: number
    startTime: string
    endTime: string
    duration: number
    timeBreak: number
  }[]
}

export function useCreateBookingSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create booking session')
      }

      return response.json()
    },
    onSuccess: (data: BookingSession) => {
      queryClient.setQueryData<BookingSession[]>(['booking-sessions'], (old) => {
        if (!old) return [data]
        return [...old, data]
      })

      queryClient.invalidateQueries({ queryKey: ['booking-sessions'] })

      navigate({ to: '/dashboard' })
    },
  })
}

export function useUpdateBookingSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string; data: UpdateBookingData }) => {
      const response = await fetch(`/api/booking/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update booking session')
      }

      return response.json()
    },
    onSuccess: (data: BookingSession) => {
      queryClient.setQueryData(['booking-session', data.id], data)

      queryClient.setQueryData<BookingSession[]>(['booking-sessions'], (old) => {
        if (!old) return [data]
        return old.map((session) => (session.id === data.id ? data : session))
      })

      queryClient.invalidateQueries({ queryKey: ['booking-sessions'] })

      navigate({ to: '/dashboard' })
    },
  })
}

export function useDeleteBookingSession() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/booking/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete booking session')
      }

      return response.json()
    },
    onSuccess: (_, sessionId: string) => {
      queryClient.removeQueries({ queryKey: ['booking-session', sessionId] })

      queryClient.setQueryData<BookingSession[]>(['booking-sessions'], (old) => {
        if (!old) return []
        return old.filter((session) => session.id !== sessionId)
      })

      queryClient.invalidateQueries({ queryKey: ['booking-sessions'] })

      navigate({ to: '/dashboard' })
    },
  })
}
