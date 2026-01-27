import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { hashPassword } from '@/lib/auth/password'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read users
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    }) as any

    if (!user || !user.role.permissions.includes('{"resource":"users","action":"read"}')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetUser = await db.user.findUnique({
      where: { id },
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

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = targetUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update users
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    }) as any

    if (!user || !user.role.permissions.includes('{"resource":"users","action":"update"}')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, roleId, phone, address, isActive, password } = body

    // Find existing user
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate role if provided
    if (roleId) {
      const role = await db.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      ...(name && { name }),
      ...(roleId && { roleId }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(isActive !== undefined && { isActive })
    }

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
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
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete users
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    }) as any

    if (!user || !user.role.permissions.includes('{"resource":"users","action":"delete"}')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}