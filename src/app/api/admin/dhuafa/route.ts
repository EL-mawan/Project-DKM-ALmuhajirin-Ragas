import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const items = await db.kaumDhuafa.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
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

    if (!user?.role.permissions.includes('{"resource":"dhuafa","action":"create"}')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, address, phone, nik, description } = body

    const newItem = await db.kaumDhuafa.create({
      data: {
        name,
        type,
        address,
        phone,
        nik,
        description
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
