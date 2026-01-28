import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read roles
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'roles', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const roles = await db.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create roles
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'roles', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    // Validate required fields
    if (!name || !permissions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if role already exists
    const existingRole = await db.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 409 })
    }

    // Create role
    const newRole = await db.role.create({
      data: {
        name,
        description,
        permissions: JSON.stringify(permissions)
      }
    })

    return NextResponse.json(newRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}