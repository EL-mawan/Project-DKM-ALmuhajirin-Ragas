import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/homepage - Get all homepage content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Public endpoint - no auth required for GET
    const content = await db.homepageContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/homepage - Create or update homepage content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission (admin only)
    if (user.role.name !== 'Admin' && user.role.name !== 'Super Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { section, title, subtitle, description, content, imageUrl, isActive, order } = body

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    // Upsert (create or update)
    const result = await db.homepageContent.upsert({
      where: { section },
      update: {
        title,
        subtitle,
        description,
        content,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0
      },
      create: {
        section,
        title,
        subtitle,
        description,
        content,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error saving homepage content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
