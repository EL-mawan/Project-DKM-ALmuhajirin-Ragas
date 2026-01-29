import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'
import { createAuditLog } from '@/lib/audit'

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

    if (!user || !checkPermission(user as any, 'dokumen', 'update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const current = await db.dokumenResmi.findUnique({ where: { id } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const { title, date, content, recipient, location, nomorSurat, status } = body

    const updated = await db.dokumenResmi.update({
      where: { id },
      data: {
        title,
        date: date ? new Date(date) : undefined,
        content,
        recipient,
        location,
        nomorSurat,
        status
      }
    })

    await createAuditLog({
      userId: user.id,
      action: `Update Dokumen: ${updated.title}`,
      table: 'dokumen_resmi',
      recordId: updated.id,
      oldValues: current,
      newValues: updated
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
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

    if (!user || !checkPermission(user as any, 'dokumen', 'delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deleted = await db.dokumenResmi.delete({ where: { id } })
    
    await createAuditLog({
      userId: user.id,
      action: `Hapus Dokumen: ${deleted.title}`,
      table: 'dokumen_resmi',
      recordId: id
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
