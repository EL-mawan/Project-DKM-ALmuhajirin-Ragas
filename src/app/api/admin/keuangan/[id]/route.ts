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

    // Check permissions
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    }) as any

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Try to delete from income first
    const income = await db.keuanganPemasukan.findUnique({ where: { id: params.id } })
    if (income) {
      if (!user.role.permissions.includes('{"resource":"keuangan_pemasukan","action":"delete"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      await db.keuanganPemasukan.delete({ where: { id: params.id } })
      return NextResponse.json({ message: 'Income record deleted' })
    }

    // Then try expense
    const expense = await db.keuanganPengeluaran.findUnique({ where: { id: params.id } })
    if (expense) {
      if (!user.role.permissions.includes('{"resource":"keuangan_pengeluaran","action":"delete"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      await db.keuanganPengeluaran.delete({ where: { id: params.id } })
      return NextResponse.json({ message: 'Expense record deleted' })
    }

    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    }) as any

    const body = await request.json()
    const { amount, source, category, description, date } = body

    // Try income
    const income = await db.keuanganPemasukan.findUnique({ where: { id: params.id } })
    if (income) {
      if (!user?.role.permissions.includes('{"resource":"keuangan_pemasukan","action":"update"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.keuanganPemasukan.update({
        where: { id: params.id },
        data: {
          amount: amount ? parseFloat(amount) : undefined,
          source,
          description,
          date: date ? new Date(date) : undefined
        }
      })
      return NextResponse.json(updated)
    }

    // Try expense
    const expense = await db.keuanganPengeluaran.findUnique({ where: { id: params.id } })
    if (expense) {
      if (!user?.role.permissions.includes('{"resource":"keuangan_pengeluaran","action":"update"}')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.keuanganPengeluaran.update({
        where: { id: params.id },
        data: {
          amount: amount ? parseFloat(amount) : undefined,
          category,
          description,
          date: date ? new Date(date) : undefined
        }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
