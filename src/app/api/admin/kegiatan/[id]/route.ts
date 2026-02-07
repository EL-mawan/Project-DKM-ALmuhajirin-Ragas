import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/kegiatan/[id] - Get specific activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const activity = await db.kegiatan.findUnique({
      where: { id }
    })

    if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(activity)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/kegiatan/[id] - Update activity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'kegiatan', 'update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, category, description, date, location, image, status } = body

    const updateData: any = {
      title,
      category,
      description,
      date: date ? new Date(date) : undefined,
      location,
      image,
      status
    }

    if (status === 'approved') {
      updateData.approvedBy = user.id
      updateData.approvedAt = new Date()
    }

    const updated = await db.kegiatan.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/kegiatan/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'kegiatan', 'delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.kegiatan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
