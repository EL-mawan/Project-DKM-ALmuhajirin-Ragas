import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      jamaahKK,
      jamaahRemaja,
      kaumDhuafa,
      kegiatan,
      laporan,
      berita,
      galeri,
      pemasukan,
      pengeluaran
    ] = await Promise.all([
      db.jamaahKepalaKeluarga.count({ where: { isActive: true } }),
      db.jamaahRemaja.count({ where: { isActive: true } }),
      db.kaumDhuafa.count({ where: { isActive: true } }),
      db.kegiatan.findMany({
        where: { status: 'approved' },
        orderBy: { date: 'asc' },
        take: 3
      }),
      db.laporanKeuangan.findFirst({
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' }
      }),
      db.berita.findMany({
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 2
      }),
      db.galeri.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8
      }),
      db.keuanganPemasukan.aggregate({
        _sum: { amount: true }
      }),
      db.keuanganPengeluaran.aggregate({
        _sum: { amount: true }
      })
    ])

    return NextResponse.json({
      stats: {
        jamaahKK,
        jamaahRemaja,
        kaumDhuafa,
        totalKegiatan: kegiatan.length
      },
      kegiatan,
      berita,
      galeri,
      keuangan: {
        totalIncome: pemasukan._sum.amount || 0,
        totalExpense: pengeluaran._sum.amount || 0,
        balance: (pemasukan._sum.amount || 0) - (pengeluaran._sum.amount || 0),
        lastReport: laporan
      }
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch public stats' }, { status: 500 })
  }
}
