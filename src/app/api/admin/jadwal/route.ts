import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    /*
    if (!checkPermission(user as any, 'jadwal', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    */
    // TEMPORARY BYPASS PERMISSION FOR DEBUGGING

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')

    const where: any = {}
    if (category && category !== 'ALL') where.category = category
    if (type && type !== 'ALL') where.type = type

    const data = await db.jadwalTugas.findMany({
      where,
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET Jadwal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    /*
    if (!checkPermission(user as any, 'jadwal', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    */
    // TEMPORARY BYPASS PERMISSION FOR DEBUGGING

    const body = await req.json()
    const { date, type, category, name, description } = body

    if (!date || !type || !category || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const item = await db.jadwalTugas.create({
      data: {
        date: new Date(date),
        type,
        category,
        name,
        description,
        isActive: true
      }
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: item.id,
        newValues: JSON.stringify(item)
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
