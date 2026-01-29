import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Total counts
    const totalJamaah = await db.jamaahKepalaKeluarga.count({ where: { isActive: true } })
    const totalRemaja = await db.jamaahRemaja.count({ where: { isActive: true } })
    const totalKegiatan = await db.kegiatan.count()
    
    // Financial stats (Simplified for dashboard)
    const incomeMonth = await db.keuanganPemasukan.aggregate({
      _sum: { amount: true },
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    const expenseMonth = await db.keuanganPengeluaran.aggregate({
      _sum: { amount: true },
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Calculate Growth for Jamaah (This month vs Last month)
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthNew = await db.jamaahKepalaKeluarga.count({
      where: {
        createdAt: { gte: thisMonthStart },
        isActive: true
      }
    })

    const lastMonthTotal = await db.jamaahKepalaKeluarga.count({
      where: {
        createdAt: { lt: thisMonthStart },
        isActive: true
      }
    })

    const growthPercent = lastMonthTotal > 0 
      ? (thisMonthNew / lastMonthTotal) * 100 
      : (thisMonthNew > 0 ? 100 : 0)

    // Generate trend data for the "sticks" (e.g., registrations over last 7 months)
    const trendData = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const count = await db.jamaahKepalaKeluarga.count({
            where: {
                createdAt: { gte: d, lte: dEnd },
                isActive: true
            }
        })
        trendData.push(count)
    }

    // Normalize trendData to percentages for height implementation
    const maxTrend = Math.max(...trendData, 1)
    const sticks = trendData.map(val => Math.max(15, (val / maxTrend) * 100))

    return NextResponse.json({
      totalJamaah,
      totalRemaja,
      totalKegiatan,
      thisMonthIncome: incomeMonth._sum.amount || 0,
      thisMonthExpense: expenseMonth._sum.amount || 0,
      growthPercent: growthPercent.toFixed(1),
      sticks,
      trendData
    })
  } catch (error: any) {
    console.error('Dashboard Stats API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
