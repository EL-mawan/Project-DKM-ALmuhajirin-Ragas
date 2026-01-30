import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id } = params

    const oldData = await db.jadwalTugas.findUnique({ where: { id } })
    if (!oldData) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const updated = await db.jadwalTugas.update({
      where: { id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: id,
        oldValues: JSON.stringify(oldData),
        newValues: JSON.stringify(updated)
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const oldData = await db.jadwalTugas.findUnique({ where: { id } })
    
    await db.jadwalTugas.delete({ where: { id } })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: id,
        oldValues: JSON.stringify(oldData)
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
