import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

export async function PATCH(
  req: NextRequest,
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

    if (!user || !checkPermission(user as any, 'jadwal', 'update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const oldData = await db.jadwalTugas.findUnique({ where: { id } })
    if (!oldData) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const { date, type, category, name, description } = body

    const updated = await db.jadwalTugas.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        type,
        category,
        name,
        description
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: id,
        oldValues: JSON.stringify(oldData),
        newValues: JSON.stringify(updated)
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH Jadwal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
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

    if (!user || !checkPermission(user as any, 'jadwal', 'delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const oldData = await db.jadwalTugas.findUnique({ where: { id } })
    if (!oldData) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    
    await db.jadwalTugas.delete({ where: { id } })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: id,
        oldValues: JSON.stringify(oldData)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE Jadwal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
