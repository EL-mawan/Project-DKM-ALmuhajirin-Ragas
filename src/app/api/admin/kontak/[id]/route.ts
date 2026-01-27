import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

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

    if (!user?.role.permissions.includes('{"resource":"kontak","action":"delete"}')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.kontakMasuk.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
