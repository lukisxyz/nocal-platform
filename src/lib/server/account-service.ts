import { db } from '@/lib/db'
import { user } from '@/lib/db-schema'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function getCurrentUserId() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw new Error('Not authenticated')
  }

  return session.user.id
}

export async function getCurrentUser(userId: string) {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return result[0] || null
}

export async function deleteAccount(userId: string) {
  const userRecord = await getCurrentUser(userId)
  if (!userRecord) {
    throw new Error('User not found')
  }

  await db.delete(user).where(eq(user.id, userId))

  return { success: true, message: 'Account deleted successfully' }
}
