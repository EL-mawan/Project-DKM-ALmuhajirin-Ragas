import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission, RoleName } from '@/lib/auth/rbac'

// GET /api/admin/laporan - Get financial reports with charts data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to read reports
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'laporan_keuangan', 'read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    let startDate: Date
    let endDate: Date
    let groupBy: string

    if (period === 'yearly') {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
      groupBy = 'month'
    } else if (period === 'monthly' && month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0)
      groupBy = 'day'
    } else {
      // Default to current month
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      groupBy = 'day'
    }

    // Get income data
    const incomeData = await db.keuanganPemasukan.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get expense data
    const expenseData = await db.keuanganPengeluaran.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get existing reports
    const reports = await db.laporanKeuangan.findMany({
      where: {
        period,
        startDate,
        endDate
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Process data for charts
    const chartData = processChartData(incomeData, expenseData, groupBy)
    
    // Calculate totals
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense

    // Group by source/category for breakdown
    const incomeBySource = incomeData.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + item.amount
      return acc
    }, {} as Record<string, number>)

    const expenseByCategory = expenseData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
        period,
        startDate,
        endDate
      },
      chartData,
      breakdown: {
        income: Object.entries(incomeBySource).map(([source, amount]) => ({
          source,
          amount,
          percentage: (amount / totalIncome) * 100
        })),
        expense: Object.entries(expenseByCategory).map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalExpense) * 100
        }))
      },
      reports
    })
  } catch (error) {
    console.error('Error fetching financial reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/laporan - Create new financial report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create reports
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    })

    if (!user || !checkPermission(user as any, 'laporan_keuangan', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, period, startDate, endDate } = body

    // Validate required fields
    if (!title || !period || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals for the period
    const incomeData = await db.keuanganPemasukan.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    })

    const expenseData = await db.keuanganPengeluaran.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    })

    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)

    // Create report
    const newReport = await db.laporanKeuangan.create({
      data: {
        title,
        period,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalIncome,
        totalExpense,
        status: 'pending',
        createdBy: user.id
      }
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    console.error('Error creating financial report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function processChartData(incomeData: any[], expenseData: any[], groupBy: string) {
  const dataMap = new Map()

  // Process income data
  incomeData.forEach(item => {
    const key = getDateKey(item.date, groupBy)
    if (!dataMap.has(key)) {
      dataMap.set(key, { date: key, income: 0, expense: 0 })
    }
    dataMap.get(key).income += item.amount
  })

  // Process expense data
  expenseData.forEach(item => {
    const key = getDateKey(item.date, groupBy)
    if (!dataMap.has(key)) {
      dataMap.set(key, { date: key, income: 0, expense: 0 })
    }
    dataMap.get(key).expense += item.amount
  })

  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function getDateKey(date: Date, groupBy: string): string {
  const d = new Date(date)
  if (groupBy === 'month') {
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })
  } else {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }
}