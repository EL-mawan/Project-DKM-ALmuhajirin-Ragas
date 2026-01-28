import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

import { checkPermission } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'galeri', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const items = await db.galeri.findMany({
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
      where: { email: session.user.email || '' },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'galeri', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, url, type, category } = body

    const newItem = await db.galeri.create({
      data: {
        title,
        imageUrl: url,
        type: type || 'foto',
        category,
        createdBy: user.id
      }
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
