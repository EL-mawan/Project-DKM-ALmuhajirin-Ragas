import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    const body = await request.json()
    const { type, ...data } = body

    if (type === 'kk') {
      if (!user?.role.permissions.includes('{"resource":"jamaah_kepala_keluarga","action":"update"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.jamaahKepalaKeluarga.update({
        where: { id: params.id },
        data // Contains nomor, blok, name, rt, rw, keterangan
      })
      return NextResponse.json(updated)
    } else {
      if (!user?.role.permissions.includes('{"resource":"jamaah_remaja","action":"update"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.jamaahRemaja.update({
        where: { id: params.id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined
        }
      })
      return NextResponse.json(updated)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'kk') {
      if (!user?.role.permissions.includes('{"resource":"jamaah_kepala_keluarga","action":"delete"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      await db.jamaahKepalaKeluarga.delete({ where: { id: params.id } })
    } else {
      if (!user?.role.permissions.includes('{"resource":"jamaah_remaja","action":"delete"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      await db.jamaahRemaja.delete({ where: { id: params.id } })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
