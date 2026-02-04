import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Execute multiple queries in parallel with individual error handling
    const [
      totalJamaah,
      totalRemaja,
      totalKegiatan,
      totalJadwal,
      incomeMonth,
      expenseMonth,
      thisMonthNew,
      lastMonthTotal,
      unreadNotifications,
      activities
    ] = await Promise.all([
      db.jamaahKepalaKeluarga.count({ where: { isActive: true } }).catch(() => 0),
      db.jamaahRemaja.count({ where: { isActive: true } }).catch(() => 0),
      db.kegiatan.count().catch(() => 0),
      db.jadwalTugas.count().catch(() => 0),
      db.keuanganPemasukan.aggregate({
        _sum: { amount: true },
        where: { date: { gte: thisMonthStart } }
      }).catch(() => ({ _sum: { amount: 0 } })),
      db.keuanganPengeluaran.aggregate({
        _sum: { amount: true },
        where: { date: { gte: thisMonthStart } }
      }).catch(() => ({ _sum: { amount: 0 } })),
      db.jamaahKepalaKeluarga.count({
        where: { createdAt: { gte: thisMonthStart }, isActive: true }
      }).catch(() => 0),
      db.jamaahKepalaKeluarga.count({
        where: { createdAt: { lt: thisMonthStart }, isActive: true }
      }).catch(() => 0),
      db.kontakMasuk.count({ where: { isRead: false } }).catch(() => 0),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { 
              name: true, 
              role: { select: { name: true } } 
            }
          }
        }
      }).catch(err => {
        console.error('AuditLog Fetch Error:', err)
        return []
      })
    ])

    // Calculate Growth
    const growthPercent = lastMonthTotal > 0 
      ? (thisMonthNew / lastMonthTotal) * 100 
      : (thisMonthNew > 0 ? 100 : 0)

    // Generate trend data for the last 7 months in parallel
    const trendPromises: Promise<number>[] = []
    for (let i = 6; i >= 0; i--) {
        const dStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        trendPromises.push(
            db.jamaahKepalaKeluarga.count({
                where: {
                    createdAt: { gte: dStart, lte: dEnd },
                    isActive: true
                }
            })
        )
    }
    const trendData = await Promise.all(trendPromises)

    // Normalize trendData for UI "sticks"
    const maxTrend = Math.max(...trendData, 1)
    const sticks = trendData.map(val => Math.max(15, (val / maxTrend) * 100))

    return NextResponse.json({
      totalJamaah,
      totalRemaja,
      totalKegiatan,
      thisMonthIncome: incomeMonth?._sum?.amount || 0,
      thisMonthExpense: expenseMonth?._sum?.amount || 0,
      growthPercent: growthPercent.toFixed(1),
      sticks,
      trendData,
      activities,
      unreadNotifications,
      totalJadwal
    })
  } catch (error: any) {
    console.error('Dashboard Stats API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  }
}
