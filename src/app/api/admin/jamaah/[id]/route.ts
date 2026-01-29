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

    const body = await request.json()
    const { type, name, phone, nomor, blok, rt, rw, keterangan, address, birthDate, education, skills } = body

    if (type === 'kk') {
      if (!user || !checkPermission(user as any, 'jamaah_kepala_keluarga', 'update')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // Check for collisions if nomor or rt is changed
      const current = await db.jamaahKepalaKeluarga.findUnique({ where: { id } })
      if (current && (current.nomor !== nomor || current.rt !== rt)) {
        const conflict = await db.jamaahKepalaKeluarga.findFirst({
          where: { nomor, rt, NOT: { id } }
        })

        if (conflict) {
          // Increment shift logic
          const toShift = await db.jamaahKepalaKeluarga.findMany({
            where: { rt, nomor: { gte: nomor }, NOT: { id } },
            orderBy: { nomor: 'desc' }
          })

          for (const item of toShift) {
            const nextVal = (parseInt(item.nomor) + 1).toString().padStart(item.nomor.length, '0')
            await db.jamaahKepalaKeluarga.update({
              where: { id: item.id },
              data: { nomor: nextVal }
            })
          }
        }
      }

      const updated = await db.jamaahKepalaKeluarga.update({
        where: { id },
        data: {
          nomor,
          blok,
          name,
          phone: phone || undefined,
          rt,
          rw,
          keterangan
        }
      })

      await createAuditLog({
        userId: user.id,
        action: 'Update Data Keluarga: ' + updated.name,
        table: 'jamaah_kepala_keluarga',
        recordId: updated.id,
        oldValues: current,
        newValues: updated
      })

      return NextResponse.json(updated)
    } else {
      if (!user || !checkPermission(user as any, 'jamaah_remaja', 'update')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.jamaahRemaja.update({
        where: { id },
        data: {
          name,
          address,
          phone,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          education,
          skills
        }
      })

      await createAuditLog({
        userId: user.id,
        action: 'Update Data Remaja: ' + updated.name,
        table: 'jamaah_remaja',
        recordId: updated.id,
        newValues: updated
      })

      return NextResponse.json(updated)
    }
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'kk') {
      if (!user || !checkPermission(user as any, 'jamaah_kepala_keluarga', 'delete')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const deleted = await db.jamaahKepalaKeluarga.delete({ where: { id } })
      await createAuditLog({
        userId: user.id,
        action: 'Hapus Data Keluarga: ' + deleted.name,
        table: 'jamaah_kepala_keluarga',
        recordId: id
      })
    } else {
      if (!user || !checkPermission(user as any, 'jamaah_remaja', 'delete')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const deleted = await db.jamaahRemaja.delete({ where: { id } })
      await createAuditLog({
        userId: user.id,
        action: 'Hapus Data Remaja: ' + deleted.name,
        table: 'jamaah_remaja',
        recordId: id
      })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
