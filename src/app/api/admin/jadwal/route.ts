import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
        userId: session.user.id,
        action: 'CREATE_JADWAL_TUGAS',
        table: 'jadwal_tugas',
        recordId: item.id,
        newValues: JSON.stringify(item)
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
