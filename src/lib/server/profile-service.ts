import { db } from '@/lib/db'
import { mentorProfile } from '@/lib/db-schema'
import { eq } from 'drizzle-orm'
import { getRequestHeaders } from '@tanstack/react-start/server'

export interface ProfileData {
  username: string
  name: string
  bio: string
  professionalField: string
  timezone: string
}

function generateUsernameFromName(name: string): string {
  // Convert to lowercase, remove special characters, replace spaces with underscores
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
}

export async function getProfile(userId: string) {
  const profile = await db.select().from(mentorProfile).where(eq(mentorProfile.userId, userId)).limit(1)

  return profile
}

export async function upsertProfile(userId: string, data: ProfileData) {
  // If username is not provided or empty, generate it from name
  const username = data.username || generateUsernameFromName(data.name)

  const result = await db
    .insert(mentorProfile)
    .values({
      id: crypto.randomUUID(),
      userId,
      username,
      name: data.name,
      bio: data.bio,
      professionalField: data.professionalField,
      timezone: data.timezone,
    })
    .onConflictDoUpdate({
      target: mentorProfile.userId,
      set: {
        username,
        name: data.name,
        bio: data.bio,
        professionalField: data.professionalField,
        timezone: data.timezone,
        updatedAt: new Date(),
      },
    })
    .returning()

  return result[0]
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
