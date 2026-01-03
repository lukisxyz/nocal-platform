import { z } from 'zod'
import { PROFESSIONAL_FIELDS, BOOKING_TYPES, TOKEN_TYPES, SESSION_DURATIONS, TIME_BREAKS } from './constants'

export const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

export const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name must be at most 50 characters'),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional().or(z.literal('')),
  professionalField: z.enum(PROFESSIONAL_FIELDS, {
    required_error: 'Please select a professional field',
  }),
  timezone: z.string().min(1, 'Timezone is required'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const deleteAccountSchema = z.object({
  confirmation: z.literal('I delete this account', {
    errorMap: () => ({ message: 'You must type "I delete this account" to confirm' }),
  }),
})

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>

export const deleteBookingSchema = z.object({
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'You must type "DELETE" to confirm' }),
  }),
})

export type DeleteBookingFormData = z.infer<typeof deleteBookingSchema>

const dayAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  startTime: z.string().regex(timeRegex, 'Time must be in HH:MM format (24-hour)'),
  endTime: z.string().regex(timeRegex, 'Time must be in HH:MM format (24-hour)'),
  duration: z.string(),
  timeBreak: z.string(),
}).refine((data) => {
  if (!data.enabled) return true
  const start = data.startTime.split(':').map(Number)
  const end = data.endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return endMinutes > startMinutes
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

export const bookingSessionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be at most 500 characters'),
  type: z.enum(Object.keys(BOOKING_TYPES) as [keyof typeof BOOKING_TYPES, ...(keyof typeof BOOKING_TYPES)[]]),
  token: z.string().optional(),
  price: z.string().optional(),
  duration: z.enum(SESSION_DURATIONS.map(String) as [string, ...string[]]),
  timeBreak: z.enum(TIME_BREAKS.map(String) as [string, ...string[]]),
  availability: z.array(dayAvailabilitySchema).min(1, 'At least one day must be enabled'),
}).superRefine((data, ctx) => {
  if (data.type === 'PAID' || data.type === 'COMMITMENT') {
    if (!data.token) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Token is required for paid sessions',
        path: ['token'],
      })
    }
    if (!data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required for paid sessions',
        path: ['price'],
      })
    } else {
      const price = parseFloat(data.price)
      if (isNaN(price) || price <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price must be a positive number',
          path: ['price'],
        })
      }
    }
  }

  if (data.type === 'FREE') {
    if (data.token) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Token should not be specified for free sessions',
        path: ['token'],
      })
    }
    if (data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price should not be specified for free sessions',
        path: ['price'],
      })
    }
  }

  const enabledDays = data.availability.filter(day => day.enabled)
  if (enabledDays.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one day must be enabled',
      path: ['availability'],
    })
  }

  enabledDays.forEach((day, index) => {
    const duration = parseInt(day.duration)
    const timeBreak = parseInt(day.timeBreak)

    if (!SESSION_DURATIONS.includes(duration)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid duration for ${DAYS_OF_WEEK[day.dayOfWeek].label}`,
        path: ['availability', index, 'duration'],
      })
    }

    if (!TIME_BREAKS.includes(timeBreak)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid time break for ${DAYS_OF_WEEK[day.dayOfWeek].label}`,
        path: ['availability', index, 'timeBreak'],
      })
    }

    if (timeBreak >= duration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Time break must be less than duration for ${DAYS_OF_WEEK[day.dayOfWeek].label}`,
        path: ['availability', index, 'timeBreak'],
      })
    }
  })
})

export type BookingSessionFormData = z.infer<typeof bookingSessionSchema>

export const updateBookingSchema = bookingSessionSchema.safeExtend({
  token: z.enum(Object.keys(TOKEN_TYPES) as [keyof typeof TOKEN_TYPES, ...(keyof typeof TOKEN_TYPES)[]]).optional(),
  isActive: z.boolean(),
})

export type UpdateBookingFormData = z.infer<typeof updateBookingSchema>

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const
