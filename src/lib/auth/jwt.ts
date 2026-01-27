import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return null

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        role: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized: Please login to access this resource')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  
  if (!user.role || !allowedRoles.includes(user.role.name)) {
    throw new Error('Forbidden: You do not have permission to access this resource')
  }
  
  return user
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}