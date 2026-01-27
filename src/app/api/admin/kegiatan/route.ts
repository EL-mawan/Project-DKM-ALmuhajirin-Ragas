import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/kegiatan - Get all activities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read activities
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'kegiatan', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [kegiatan, total] = await Promise.all([
      db.kegiatan.findMany({
        where,
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      db.kegiatan.count({ where })
    ])

    return NextResponse.json({
      data: kegiatan,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/kegiatan - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create activities
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'kegiatan', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, date, location, image } = body

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create activity
    const newKegiatan = await db.kegiatan.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        image,
        status: 'pending',
        createdBy: user.id
      }
    })

    return NextResponse.json(newKegiatan, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}