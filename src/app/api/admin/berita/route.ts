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

    if (!user || !checkPermission(user as any, 'berita', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const berita = await db.berita.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(berita)
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

    if (!user || !checkPermission(user as any, 'berita', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, image, category, status } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const newBerita = await db.berita.create({
      data: {
        title,
        content,
        image,
        status: status || 'draft',
        createdBy: user.id
      }
    })

    return NextResponse.json(newBerita, { status: 201 })
  } catch (error) {
    console.error('Error creating berita:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
