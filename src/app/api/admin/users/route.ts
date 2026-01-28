import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { hashPassword } from '@/lib/auth/password'
import { ROLE_CONFIGS, checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read users
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'users', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await db.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create users
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'users', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, roleId, phone, address } = body

    // Validate required fields
    if (!email || !name || !password || !roleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Validate role exists
    const role = await db.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        roleId,
        phone,
        address,
        isActive: true
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}