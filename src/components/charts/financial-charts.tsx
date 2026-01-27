'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'

interface FinancialChartProps {
  data: any[]
  title: string
  type: 'bar' | 'pie' | 'line'
  dataKey?: string
  xAxisKey?: string
  colors?: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function FinancialChart({ 
  data, 
  title, 
  type, 
  dataKey = 'amount', 
  xAxisKey = 'date',
  colors = COLORS 
}: FinancialChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Tidak ada data tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Belum ada data untuk ditampilkan
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
              <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                labelFormatter={(label) => `Tanggal: ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Pemasukan" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Pengeluaran" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {type === 'bar' && 'Perbandingan pemasukan dan pengeluaran'}
          {type === 'pie' && 'Distribusi berdasarkan kategori'}
          {type === 'line' && 'Tren keuangan periode ini'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

interface FinancialSummaryProps {
  totalIncome: number
  totalExpense: number
  balance: number
  period: string
}

export function FinancialSummary({ 
  totalIncome, 
  totalExpense, 
  balance, 
  period 
}: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const isPositive = balance >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          <div className="h-4 w-4 text-green-600">↑</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Periode {period}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <div className="h-4 w-4 text-red-600">↓</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground">
            Periode {period}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <div className={`h-4 w-4 ${isPositive ? 'text-blue-600' : 'text-red-600'}`}>
            {isPositive ? '→' : '⚠'}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs">
              {isPositive ? 'Sehat' : 'Defisit'}
            </Badge>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}