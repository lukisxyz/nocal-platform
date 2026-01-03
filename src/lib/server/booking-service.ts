import { db } from '@/lib/db'
import { bookingSession, mentorAvailability, mentorProfile } from '@/lib/db-schema'
import { eq, and } from 'drizzle-orm'
import { getRequestHeaders } from '@tanstack/react-start/server'

export interface BookingSessionData {
  title: string
  description: string
  type: 'FREE' | 'PAID' | 'COMMITMENT'
  token?: string
  price?: string
  duration: number
  timeBreak: number
}

export interface AvailabilityData {
  dayOfWeek: number
  startTime: string
  endTime: string
  duration: number
  timeBreak: number
}

export interface CreateBookingData {
  session: BookingSessionData
  availability: AvailabilityData[]
}

export interface UpdateBookingData {
  session: Partial<BookingSessionData>
  availability?: AvailabilityData[] // If provided, replaces all existing availability
}

export async function getCurrentUserId() {
  const headers = getRequestHeaders()
  const { auth } = await import('@/lib/auth')
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session.user.id
}

export async function getMentorProfileId(userId: string) {
  const profile = await db
    .select()
    .from(mentorProfile)
    .where(eq(mentorProfile.userId, userId))
    .limit(1)

  if (profile.length === 0) {
    throw new Error('Mentor profile not found')
  }

  return profile[0].id
}

export async function getBookingSession(sessionId: string, mentorId: string) {
  const session = await db
    .select()
    .from(bookingSession)
    .where(and(eq(bookingSession.id, sessionId), eq(bookingSession.mentorId, mentorId)))
    .limit(1)

  return session[0] || null
}

export async function getBookingSessions(mentorId: string) {
  const sessions = await db
    .select()
    .from(bookingSession)
    .where(eq(bookingSession.mentorId, mentorId))

  return sessions
}

export async function getBookingSessionWithAvailability(sessionId: string, mentorId: string) {
  const session = await getBookingSession(sessionId, mentorId)
  if (!session) {
    return null
  }

  const availability = await db
    .select()
    .from(mentorAvailability)
    .where(eq(mentorAvailability.mentorId, mentorId))

  return {
    ...session,
    availability,
  }
}

export async function createBookingSession(userId: string, data: CreateBookingData) {
  const mentorId = await getMentorProfileId(userId)

  const sessionResult = await db
    .insert(bookingSession)
    .values({
      id: crypto.randomUUID(),
      mentorId,
      title: data.session.title,
      description: data.session.description,
      type: data.session.type,
      token: data.session.token || null,
      price: data.session.price || null,
      duration: data.session.duration,
      timeBreak: data.session.timeBreak,
      isActive: true,
    })
    .returning()

  const session = sessionResult[0]

  if (data.availability && data.availability.length > 0) {
    await db.insert(mentorAvailability).values(
      data.availability.map((avail) => ({
        id: crypto.randomUUID(),
        mentorId,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        duration: avail.duration,
        timeBreak: avail.timeBreak,
        isActive: true,
      }))
    )
  }

  const availability = await db
    .select()
    .from(mentorAvailability)
    .where(eq(mentorAvailability.mentorId, mentorId))

  return {
    ...session,
    availability,
  }
}

export async function updateBookingSession(
  userId: string,
  sessionId: string,
  data: UpdateBookingData
) {
  const mentorId = await getMentorProfileId(userId)

  const existingSession = await getBookingSession(sessionId, mentorId)
  if (!existingSession) {
    throw new Error('Booking session not found or unauthorized')
  }

  if (Object.keys(data.session).length > 0) {
    await db
      .update(bookingSession)
      .set({
        ...data.session,
        updatedAt: new Date(),
      })
      .where(eq(bookingSession.id, sessionId))
  }

  if (data.availability !== undefined) {
    await db.delete(mentorAvailability).where(eq(mentorAvailability.mentorId, mentorId))

    if (data.availability.length > 0) {
      await db.insert(mentorAvailability).values(
        data.availability.map((avail) => ({
          id: crypto.randomUUID(),
          mentorId,
          dayOfWeek: avail.dayOfWeek,
          startTime: avail.startTime,
          endTime: avail.endTime,
          duration: avail.duration,
          timeBreak: avail.timeBreak,
          isActive: true,
        }))
      )
    }
  }

  return await getBookingSessionWithAvailability(sessionId, mentorId)
}

export async function deleteBookingSession(userId: string, sessionId: string) {
  const mentorId = await getMentorProfileId(userId)

  const existingSession = await getBookingSession(sessionId, mentorId)
  if (!existingSession) {
    throw new Error('Booking session not found or unauthorized')
  }

  await db.delete(mentorAvailability).where(eq(mentorAvailability.mentorId, mentorId))

  await db.delete(bookingSession).where(eq(bookingSession.id, sessionId))

  return { success: true }
}
