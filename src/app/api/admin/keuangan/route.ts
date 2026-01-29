import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'
import { createAuditLog } from '@/lib/audit'

// GET /api/admin/keuangan - Get financial summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read financial data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const hasIncomePermission = checkPermission(user as any, 'keuangan_pemasukan', 'read')
    const hasExpensePermission = checkPermission(user as any, 'keuangan_pengeluaran', 'read')
    const hasReportPermission = checkPermission(user as any, 'laporan_keuangan', 'read')

    if (!hasIncomePermission && !hasExpensePermission && !hasReportPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const type = searchParams.get('type') // 'income', 'expense', 'all'
    const qStartDate = searchParams.get('startDate')
    const qEndDate = searchParams.get('endDate')

    // Build date filter
    let dateFilter = {}
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      dateFilter = {
        gte: startDate,
        lte: endDate
      }
    } else if (qStartDate && qEndDate) {
      dateFilter = {
        gte: new Date(qStartDate),
        lte: new Date(qEndDate)
      }
    }

    let result: any = {}

    // Get income data if user has permission
    if (hasIncomePermission && (type === 'income' || type === 'all')) {
      const incomeData = await db.keuanganPemasukan.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: { date: 'desc' },
        take: type === 'all' ? 100 : 50
      })

      const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
      
      result.income = {
        data: incomeData,
        total: totalIncome,
        count: incomeData.length
      }
    }

    // Get expense data if user has permission
    if (hasExpensePermission && (type === 'expense' || type === 'all')) {
      const expenseData = await db.keuanganPengeluaran.findMany({
        where: {
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: { date: 'desc' },
        take: type === 'all' ? 100 : 50
      })

      const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)
      
      result.expense = {
        data: expenseData,
        total: totalExpense,
        count: expenseData.length
      }
    }

    // Calculate balance if user has both permissions
    if (hasIncomePermission && hasExpensePermission) {
      result.balance = (result.income?.total || 0) - (result.expense?.total || 0)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/keuangan - Add income or expense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, source, sourceUnit, qty, unitPrice, itemName, unitType, category, description, date } = body

    // Validate required fields
    if (!type || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check permissions based on type
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let result
    if (type === 'income') {
      if (!checkPermission(user as any, 'keuangan_pemasukan', 'create')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (!source) return NextResponse.json({ error: 'Source is required' }, { status: 400 })

      result = await db.keuanganPemasukan.create({
        data: {
          amount: parseFloat(amount) || (parseFloat(qty || 1) * parseFloat(unitPrice || 0)),
          source,
          sourceUnit,
          qty: parseFloat(qty || 1),
          unitPrice: parseFloat(unitPrice || 0),
          description,
          date: new Date(date),
          createdBy: user.id
        }
      })

      await createAuditLog({
        userId: user.id,
        action: 'Pemasukan Baru: ' + (result.source),
        table: 'keuangan_pemasukan',
        recordId: result.id,
        newValues: result
      })
    } else if (type === 'expense') {
      if (!checkPermission(user as any, 'keuangan_pengeluaran', 'create')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (!itemName) return NextResponse.json({ error: 'Item name is required' }, { status: 400 })

      result = await db.keuanganPengeluaran.create({
        data: {
          itemName,
          amount: parseFloat(amount) || (parseFloat(qty || 1) * parseFloat(unitPrice || 0)),
          unitPrice: parseFloat(unitPrice || 0),
          qty: parseFloat(qty || 1),
          unitType,
          category: category || 'Lainnya',
          description,
          date: new Date(date),
          createdBy: user.id
        }
      })

      await createAuditLog({
        userId: user.id,
        action: 'Pengeluaran Baru: ' + (result.itemName),
        table: 'keuangan_pengeluaran',
        recordId: result.id,
        newValues: result
      })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating financial record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}