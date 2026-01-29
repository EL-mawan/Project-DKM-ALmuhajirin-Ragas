import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth/config'
import { checkPermission } from '@/lib/auth/rbac'

// GET /api/admin/laporan/export - Export financial report as PDF
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const format = searchParams.get('format') || 'json'

    let startDate: Date
    let endDate: Date

    if (period === 'yearly') {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31)
    } else if (period === 'monthly' && month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0)
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    // Get financial data
    const incomeData = await db.keuanganPemasukan.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' },
      include: {
        // Include creator info if needed
      }
    })

    const expenseData = await db.keuanganPengeluaran.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)
    const balance = totalIncome - totalExpense

    // Group data by category/source
    const incomeBySource = incomeData.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + item.amount
      return acc
    }, {} as Record<string, number>)

    const expenseByCategory = expenseData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount
      return acc
    }, {} as Record<string, number>)

    // Generate report data
    const reportData = {
      title: `Laporan Keuangan Al-Muhajirin`,
      period: period === 'yearly' ? `Tahun ${year}` : `Bulan ${month} ${year}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      summary: {
        totalIncome,
        totalExpense,
        balance
      },
      incomeBreakdown: Object.entries(incomeBySource).map(([source, amount]) => ({
        source,
        amount,
        percentage: ((amount / totalIncome) * 100).toFixed(2)
      })),
      expenseBreakdown: Object.entries(expenseByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / totalExpense) * 100).toFixed(2)
      })),
      transactions: {
        income: incomeData.map(item => ({
          date: item.date.toISOString().split('T')[0],
          source: item.source,
          amount: item.amount,
          description: item.description
        })),
        expense: expenseData.map(item => ({
          date: item.date.toISOString().split('T')[0],
          category: item.category,
          amount: item.amount,
          description: item.description
        }))
      }
    }

    if (format === 'pdf') {
      // Generate PDF content (simplified HTML to PDF conversion)
      const htmlContent = generatePDFHTML(reportData)
      
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="laporan-keuangan-${period}-${year}${period === 'monthly' ? `-${month}` : ''}.html"`
        }
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error exporting financial report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generatePDFHTML(data: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .amount {
            font-size: 1.5em;
            font-weight: bold;
        }
        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .balance { color: #3b82f6; }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.title}</h1>
        <p><strong>Periode:</strong> ${data.period}</p>
        <p><strong>Tanggal:</strong> ${new Date(data.startDate).toLocaleDateString('id-ID')} - ${new Date(data.endDate).toLocaleDateString('id-ID')}</p>
        <p><strong>Dibuat:</strong> ${new Date(data.generatedAt).toLocaleDateString('id-ID')} oleh ${data.generatedBy}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Pemasukan</h3>
            <div class="amount income">${formatCurrency(data.summary.totalIncome)}</div>
        </div>
        <div class="summary-card">
            <h3>Total Pengeluaran</h3>
            <div class="amount expense">${formatCurrency(data.summary.totalExpense)}</div>
        </div>
        <div class="summary-card">
            <h3>Saldo</h3>
            <div class="amount balance">${formatCurrency(data.summary.balance)}</div>
        </div>
    </div>

    <div class="section">
        <h2>Rincian Pemasukan</h2>
        <table>
            <thead>
                <tr>
                    <th>Sumber</th>
                    <th>Jumlah</th>
                    <th>Persentase</th>
                </tr>
            </thead>
            <tbody>
                ${data.incomeBreakdown.map((item: any) => `
                    <tr>
                        <td>${item.source}</td>
                        <td>${formatCurrency(item.amount)}</td>
                        <td>${item.percentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Rincian Pengeluaran</h2>
        <table>
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Persentase</th>
                </tr>
            </thead>
            <tbody>
                ${data.expenseBreakdown.map((item: any) => `
                    <tr>
                        <td>${item.category}</td>
                        <td>${formatCurrency(item.amount)}</td>
                        <td>${item.percentage}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Detail Transaksi Pemasukan</h2>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Sumber</th>
                    <th>Jumlah</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                ${data.transactions.income.map((item: any) => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString('id-ID')}</td>
                        <td>${item.source}</td>
                        <td>${formatCurrency(item.amount)}</td>
                        <td>${item.description || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Detail Transaksi Pengeluaran</h2>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                ${data.transactions.expense.map((item: any) => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString('id-ID')}</td>
                        <td>${item.category}</td>
                        <td>${formatCurrency(item.amount)}</td>
                        <td>${item.description || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh sistem administrasi Al-Muhajirin</p>
        <p>Masjid Jami' Al-Muhajirin Ragas Grenyang</p>
    </div>
</body>
</html>
  `
}