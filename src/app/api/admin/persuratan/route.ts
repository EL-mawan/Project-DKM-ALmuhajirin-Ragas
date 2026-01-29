import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // PROPOSAL, UNDANGAN, SURAT_RESMI

    const data = await db.dokumenResmi.findMany({
      where: type ? { type } : {},
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(data)
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

    if (!user || !checkPermission(user as any, 'dokumen', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, title, date, content, recipient, location, nomorSurat } = body

    const newItem = await db.dokumenResmi.create({
      data: {
        type,
        title,
        date: new Date(date),
        content,
        recipient,
        location,
        nomorSurat,
        createdBy: user.id
      }
    })

    await createAuditLog({
      userId: user.id,
      action: `Buat Dokumen ${type}: ${newItem.title}`,
      table: 'dokumen_resmi',
      recordId: newItem.id,
      newValues: newItem
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error: any) {
    console.error('Document POST Error:', error)
    return NextResponse.json({ error: 'Gagal membuat dokumen', details: error.message }, { status: 500 })
  }
}
