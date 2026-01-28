import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'kk' // 'kk' or 'remaja'

    if (type === 'kk') {
      const data = await db.jamaahKepalaKeluarga.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(data)
    } else {
      const data = await db.jamaahRemaja.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    const body = await request.json()
    const { type, ...rest } = body

    if (type === 'kk') {
      if (!user || !checkPermission(user as any, 'jamaah_kepala_keluarga', 'create')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // rest contains nomor, blok, name, rt, rw, keterangan
      const newItem = await db.jamaahKepalaKeluarga.create({ data: rest })
      return NextResponse.json(newItem, { status: 201 })
    } else if (type === 'remaja') {
      if (!user || !checkPermission(user as any, 'jamaah_remaja', 'create')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const newItem = await db.jamaahRemaja.create({ 
        data: {
          ...rest,
          birthDate: rest.birthDate ? new Date(rest.birthDate) : undefined
        } 
      })
      return NextResponse.json(newItem, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Jamaah Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
