import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

import { checkPermission } from '@/lib/auth/rbac'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'struktur', 'update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, position, description, image, order } = body

    const updated = await db.strukturOrganisasi.update({
      where: { id: id },
      data: {
        name,
        position,
        description,
        image,
        order: order !== undefined ? parseInt(order.toString(), 10) : undefined
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Update Struktur Error:', error)
    return NextResponse.json({ 
      error: 'Gagal memperbarui data pengurus', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'struktur', 'delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.strukturOrganisasi.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
