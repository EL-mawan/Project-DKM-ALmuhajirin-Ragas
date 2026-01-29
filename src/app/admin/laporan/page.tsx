'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, Download, Trash2, Eye, Calendar, DollarSign, ArrowUpCircle, ArrowDownCircle, Printer, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LaporanAdmin() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [transactions, setTransactions] = useState({ income: [], expense: [] })
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    fileUrl: '',
    totalIncome: 0,
    totalExpense: 0,
    notes: ''
  })

  const generatePDF = async (data: any, txs: any) => {
    try {
      setIsExportingPDF(true)
      // Initialize as A4
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      })

      const dkmEmerald: [number, number, number] = [11, 61, 46] // #0b3d2e
      const dkmOrange: [number, number, number] = [245, 158, 11] // #f59e0b
      const dkmRose: [number, number, number] = [244, 63, 94] // #f43f5e
      const dkmSlate: [number, number, number] = [15, 23, 42] // #0f172a
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const centerX = pageWidth / 2

      // Function to draw header (Kop) on every page
      const drawHeader = (docObj: jsPDF, logo: HTMLImageElement | null) => {
        // --- 1. LOGO & HEADER ---
        if (logo && logo.complete && logo.naturalWidth > 0) {
          docObj.addImage(logo, 'PNG', centerX - 10, 10, 20, 20)
        } else {
          docObj.setFillColor(dkmOrange[0], dkmOrange[1], dkmOrange[2])
          docObj.circle(centerX, 20, 10, 'F')
        }

        docObj.setFontSize(16)
        docObj.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
        docObj.setFont('helvetica', 'bold')
        docObj.text('LAPORAN PENANGGUNG JAWABAN', centerX, 38, { align: 'center' })
        
        docObj.setFontSize(11)
        docObj.setTextColor(dkmOrange[0], dkmOrange[1], dkmOrange[2])
        docObj.text('KEUANGAN DKM AL-MUHAJIRIN KP. RAGAS GRENYANG', centerX, 44, { align: 'center' })
        
        docObj.setDrawColor(dkmOrange[0], dkmOrange[1], dkmOrange[2])
        docObj.setLineWidth(0.8)
        docObj.line(15, 48, pageWidth - 15, 48)
        docObj.setLineWidth(0.2)
        docObj.line(15, 49.5, pageWidth - 15, 49.5)
      }

      // Pre-load logo
      let logoImg: HTMLImageElement | null = null
      try {
        logoImg = new Image()
        logoImg.src = '/logo.png'
        await new Promise((resolve) => {
          if (!logoImg) return resolve(null)
          logoImg.onload = () => resolve(logoImg)
          logoImg.onerror = () => resolve(null)
        })
      } catch (e) {
        logoImg = null
      }

      // Initial Header for first page
      drawHeader(doc, logoImg)

      // --- 2. SUMMARY SECTION (Only on first page) ---
      // Add Nama Periode Laporan (Title) - Reduced size
      doc.setFontSize(11)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.setFont('helvetica', 'bold')
      doc.text(data.title.toUpperCase(), centerX, 58, { align: 'center' })
      
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      doc.text(`Tahun ${new Date().getFullYear()}`, centerX, 64, { align: 'center' })
      
      const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text(`Ditetapkan: ${dateStr}`, centerX, 68, { align: 'center' })

      const cardY = 74
      const cardW = 58
      const cardH = 28
      const startX = 13

      // Income Card
      doc.setFillColor(240, 253, 244)
      doc.roundedRect(startX, cardY, cardW, cardH, 4, 4, 'F')
      doc.setFontSize(7)
      doc.setTextColor(16, 185, 129)
      doc.setFont('helvetica', 'bold')
      doc.text('TOTAL PEMASUKAN', startX + cardW/2, cardY + 10, { align: 'center' })
      doc.setFontSize(11)
      doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.text(`Rp ${data.totalIncome.toLocaleString('id-ID')}`, startX + cardW/2, cardY + 20, { align: 'center' })

      // Expense Card
      doc.setFillColor(255, 241, 242)
      doc.roundedRect(startX + cardW + 3, cardY, cardW, cardH, 4, 4, 'F')
      doc.setFontSize(7)
      doc.setTextColor(dkmRose[0], dkmRose[1], dkmRose[2])
      doc.text('TOTAL PENGELUARAN', startX + cardW + 3 + cardW/2, cardY + 10, { align: 'center' })
      doc.setFontSize(11)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.text(`Rp ${data.totalExpense.toLocaleString('id-ID')}`, startX + cardW + 3 + cardW/2, cardY + 20, { align: 'center' })

      // Balance Card
      doc.setFillColor(255, 251, 235)
      doc.roundedRect(startX + (cardW + 3) * 2, cardY, cardW, cardH, 4, 4, 'F')
      doc.setFontSize(7)
      doc.setTextColor(dkmOrange[0], dkmOrange[1], dkmOrange[2])
      doc.text('SALDO AKHIR', startX + (cardW + 3) * 2 + cardW/2, cardY + 10, { align: 'center' })
      doc.setFontSize(11)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.text(`Rp ${(data.totalIncome - data.totalExpense).toLocaleString('id-ID')}`, startX + (cardW + 3) * 2 + cardW/2, cardY + 20, { align: 'center' })

      // --- 3. DETAILS SECTION (AUTO-PAGINATED) ---
      let currentY = cardY + cardH + 12

      // Section A: Pemasukan
      doc.setFontSize(10)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.setFont('helvetica', 'bold')
      doc.text('A. DATA PEMASUKAN', 15, currentY - 2)

      // Table for Pemasukan
      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Tanggal', 'Sumber Dana', 'Qty', 'Unit', 'Harga Satuan', 'Total']],
        body: txs.income.length > 0 ? txs.income.map((t: any, i: number) => [
          i + 1, 
          new Date(t.date).toLocaleDateString('id-ID'), 
          t.source || '-',
          t.qty || 1,
          t.sourceUnit || '-',
          `Rp ${(t.unitPrice || t.amount).toLocaleString('id-ID')}`,
          `Rp ${t.amount.toLocaleString('id-ID')}`
        ]) : [['-', '-', 'Tidak ada data pemasukan', '-', '-', '-', 'Rp 0']],
        margin: { top: 55, bottom: 25 },
        didDrawPage: (dt) => {
          if (dt.pageNumber > 1) {
            drawHeader(doc, logoImg)
          }
        },
        headStyles: { fillColor: [240, 253, 244], textColor: dkmEmerald, fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
          0: { cellWidth: 10 },
          3: { halign: 'center' },
          5: { halign: 'right' },
          6: { halign: 'right', fontStyle: 'bold' } 
        }
      })

      currentY = (doc as any).lastAutoTable.finalY + 12
      
      // Section B: Pengeluaran
      doc.setFontSize(10)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.setFont('helvetica', 'bold')
      doc.text('B. DATA PENGELUARAN', 15, currentY - 2)

      // Table for Pengeluaran
      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Tanggal', 'Nama Barang', 'Kategori', 'Qty', 'Satuan', 'Harga', 'Total']],
        body: txs.expense.length > 0 ? txs.expense.map((t: any, i: number) => [
          i + 1,
          new Date(t.date).toLocaleDateString('id-ID'),
          t.itemName || '-',
          t.category || '-',
          t.qty || 1,
          t.unitType || '-',
          `Rp ${(t.unitPrice || t.amount).toLocaleString('id-ID')}`,
          `Rp ${t.amount.toLocaleString('id-ID')}`
        ]) : [['-', '-', 'Tidak ada data pengeluaran', '-', '-', '-', '-', 'Rp 0']],
        margin: { top: 55, bottom: 25 },
        didDrawPage: (dt) => {
          drawHeader(doc, logoImg)
        },
        headStyles: { fillColor: [255, 241, 242], textColor: dkmRose, fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
          0: { cellWidth: 10 },
          4: { halign: 'center' },
          6: { halign: 'right' },
          7: { halign: 'right', fontStyle: 'bold' } 
        }
      })

      currentY = (doc as any).lastAutoTable.finalY + 12
      
      // Section C: Saldo Akhir Summary Table
      doc.setFontSize(10)
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
      doc.setFont('helvetica', 'bold')
      doc.text('C. SALDO AKHIR', 15, currentY - 2)

      autoTable(doc, {
        startY: currentY,
        head: [['Total Pemasukan', 'Total Pengeluaran', 'Saldo Akhir']],
        body: [[
           `Rp ${data.totalIncome.toLocaleString('id-ID')}`,
           `Rp ${data.totalExpense.toLocaleString('id-ID')}`,
           `Rp ${(data.totalIncome - data.totalExpense).toLocaleString('id-ID')}`
        ]],
        margin: { top: 55, bottom: 25 },
        headStyles: { fillColor: [255, 251, 235], textColor: [180, 83, 9], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9, cellPadding: 5, halign: 'center' },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: dkmEmerald },
          1: { fontStyle: 'bold', textColor: dkmRose },
          2: { fontStyle: 'bold', textColor: dkmSlate, fillColor: [248, 250, 252] }
        }
      })

      currentY = (doc as any).lastAutoTable.finalY + 15
      
      if (currentY + 50 > 280) {
        doc.addPage()
        drawHeader(doc, logoImg)
        currentY = 60
      }

      doc.setFontSize(10)
      doc.setTextColor(0)
      doc.setFont('helvetica', 'bold')
      doc.text('Mengetahui,', 55, currentY, { align: 'center' })
      doc.text('Ketua DKM Al-Muhajirin', 55, currentY + 6, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      const agungName = 'H. Agung Gunawan'
      const agungWidth = doc.getTextWidth(agungName)
      doc.text(agungName, 55, currentY + 35, { align: 'center' })
      doc.setLineWidth(0.3)
      doc.line(55 - agungWidth/2, currentY + 36, 55 + agungWidth/2, currentY + 36)

      doc.setFont('helvetica', 'bold')
      doc.text('Hormat kami,', pageWidth - 55, currentY, { align: 'center' })
      doc.text('Bendahara DKM', pageWidth - 55, currentY + 6, { align: 'center' })
      
      const lasturiName = 'Lasturi'
      const lasturiWidth = doc.getTextWidth(lasturiName)
      doc.text(lasturiName, pageWidth - 55, currentY + 35, { align: 'center' })
      doc.line(pageWidth - 55 - lasturiWidth/2, currentY + 36, pageWidth - 55 + lasturiWidth/2, currentY + 36)

      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(150)
        doc.text(`Halaman ${i} dari ${totalPages}`, centerX, 285, { align: 'center' })
        doc.text(`Dicetak pada ${new Date().toLocaleString('id-ID')}`, centerX, 289, { align: 'center' })
      }

      doc.save(`LPJ_${data.title.replace(/\s+/g, '_')}.pdf`)
      toast.success('LPJ Berhasil dicetak dalam format A4')
    } catch (error) {
      console.error(error)
      toast.error('Gagal mencetak PDF')
    } finally {
      setIsExportingPDF(false)
    }
  }

  const fetchCalculations = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error('Pilih rentang tanggal terlebih dahulu')
      return
    }
    try {
      setIsFetching(true)
      const res = await fetch(`/api/admin/keuangan?type=all&startDate=${formData.startDate}&endDate=${formData.endDate}`)
      const data = await res.json()
      if (res.ok) {
        setTransactions({
          income: data.income?.data || [],
          expense: data.expense?.data || []
        })
        setFormData(prev => ({
          ...prev,
          totalIncome: data.income?.total || 0,
          totalExpense: data.expense?.total || 0
        }))
        toast.success('Data keuangan berhasil ditarik')
      }
    } catch (error) {
      toast.error('Gagal menarik data keuangan')
    } finally {
      setIsFetching(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/laporan')
      const json = await res.json()
      if (res.ok) {
        setReports(Array.isArray(json) ? json : json.reports || [])
      }
    } catch (error) {
      toast.error('Gagal mengambil data laporan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/admin/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success('Laporan berhasil diterbitkan')
        setIsModalOpen(false)
        setFormData({ title: '', period: 'monthly', startDate: '', endDate: '', fileUrl: '', totalIncome: 0, totalExpense: 0, notes: '' })
        fetchData()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus laporan ini?')) return
    try {
      const res = await fetch(`/api/admin/laporan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Laporan dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus laporan')
    }
  }

  const filteredReports = reports.filter((r: any) => 
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const balance = formData.totalIncome - formData.totalExpense

  const reprintReport = async (report: any) => {
    try {
      toast.info('Menyiapkan dokumen LPJ...')
      const sDate = report.startDate?.includes('T') ? report.startDate.split('T')[0] : report.startDate
      const eDate = report.endDate?.includes('T') ? report.endDate.split('T')[0] : report.endDate
      const res = await fetch(`/api/admin/keuangan?type=all&startDate=${sDate}&endDate=${eDate}`)
      const data = await res.json()
      if (res.ok) {
        generatePDF({
          title: report.title,
          startDate: new Date(report.startDate).toLocaleDateString('id-ID'),
          endDate: new Date(report.endDate).toLocaleDateString('id-ID'),
          totalIncome: report.totalIncome,
          totalExpense: report.totalExpense,
          notes: report.notes || ''
        }, {
          income: data.income?.data || [],
          expense: data.expense?.data || []
        })
      }
    } catch (error) {
      toast.error('Gagal mencetak ulang laporan')
    }
  }

  return (
    <AdminLayout title="Cetak LPJ" subtitle="Cetak dan publikasi transparansi dokumen LPJ dana umat secara berkala.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Arsip Laporan</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Total {filteredReports.length} laporan dipublikasikan.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Buat Laporan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[550px] p-0 overflow-hidden border-none rounded-4xl shadow-2xl max-h-[90vh] flex flex-col mx-auto">
              <div className="p-6 sm:p-8 pb-4">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl font-black text-[#0b3d2e] tracking-tight">Buat Laporan Baru</DialogTitle>
                </DialogHeader>
              </div>

              <div className="px-6 sm:px-8 pb-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div>
                  <Label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#0b3d2e]/60 mb-2 block">Nama Periode Laporan</Label>
                  <Input 
                    required 
                    placeholder="Contoh: Laporan Rutin Januari 2024"
                    className="h-12 sm:h-14 rounded-2xl border-emerald-200 focus:ring-emerald-500 bg-emerald-50/10 placeholder:text-emerald-900/20 text-[#0b3d2e] text-sm sm:text-base"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Search className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-emerald-800/80 leading-relaxed">
                    Laporan ini secara otomatis merekapitulasi seluruh data keuangan yang telah dicatat pada sistem untuk rentang tanggal yang dipilih.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Tanggal Mulai</Label>
                    <div className="relative">
                      <Input 
                        required 
                        type="date" 
                        className="h-12 sm:h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 pr-10 text-sm"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Tanggal Selesai</Label>
                    <div className="relative">
                      <Input 
                        required 
                        type="date" 
                        className="h-12 sm:h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 pr-10 text-sm"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-100 p-5 sm:p-6 rounded-4xl relative overflow-hidden group">
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h4 className="font-extrabold text-[#0b3d2e] text-xs sm:text-sm uppercase tracking-wide">Kalkulasi Otomatis</h4>
                    <Button 
                      type="button"
                      size="sm" 
                      onClick={fetchCalculations}
                      disabled={isFetching}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 h-9 px-4 font-bold text-[10px] sm:text-xs border-none"
                    >
                      {isFetching ? 'Memuat...' : 'Tarik Data'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-[#0b3d2e]/40">Total Pemasukan</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600">Rp</div>
                        <Input 
                          readOnly
                          className="h-11 sm:h-12 pl-10 rounded-2xl border-neutral-200/50 bg-white font-black text-emerald-600 transition-all text-sm"
                          value={formData.totalIncome.toLocaleString('id-ID')}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-[#0b3d2e]/40">Total Pengeluaran</Label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-500">Rp</div>
                        <Input 
                          readOnly
                          className="h-11 sm:h-12 pl-10 rounded-2xl border-neutral-200/50 bg-white font-black text-rose-500 transition-all text-sm"
                          value={formData.totalExpense.toLocaleString('id-ID')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 relative z-10 border-t border-emerald-100/50 mt-2">
                    <span className="text-sm font-black text-[#0b3d2e]">Estimasi Saldo:</span>
                    <span className={cn(
                      "text-lg font-black",
                      balance >= 0 ? "text-emerald-600" : "text-rose-500"
                    )}>
                      Rp {balance.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Keterangan Tambahan</Label>
                  <textarea 
                    placeholder="Berikan ringkasan atau catatan penting untuk laporan ini..."
                    className="w-full min-h-[100px] rounded-2xl border border-neutral-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-neutral-50/50 placeholder:text-neutral-400 text-[#0b3d2e]"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-4 bg-gray-50/50 border-t flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 sm:h-14 rounded-2xl font-bold text-neutral-500 hover:bg-white hover:text-neutral-900 border-none order-3 sm:order-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  className="flex-1 h-12 sm:h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100 text-white border-none order-1 sm:order-2"
                  onClick={() => generatePDF(formData, transactions)}
                  disabled={isExportingPDF || !formData.startDate}
                >
                  {isExportingPDF ? 'Memproses...' : 'Cetak PDF'}
                </Button>
                <Button 
                  className="flex-1 h-12 sm:h-14 rounded-2xl font-bold bg-[#0b3d2e] hover:bg-[#062c21] shadow-xl shadow-emerald-900/10 text-white border-none order-2 sm:order-3"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Daftar Dokumen</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari laporan..." 
                  className="pl-10 rounded-full bg-gray-50/50 border-gray-100 focus:bg-white transition-all h-12"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Belum ada laporan dipublikasikan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Laporan</th>
                      <th className="px-8 py-5">Periode</th>
                      <th className="px-8 py-5">Input/Output</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredReports.map((report: any) => (
                      <tr key={report.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                               <div className="font-bold text-[#0b3d2e]">{report.title}</div>
                               <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
                                 Oleh Admin • {new Date(report.createdAt).toLocaleDateString('id-ID')}
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center text-xs font-medium text-neutral-600">
                             <Calendar className="h-3 w-3 mr-1.5 text-primary" />
                             {new Date(report.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} - {new Date(report.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col space-y-1">
                              <div className="text-[10px] font-black text-emerald-600 flex items-center">
                                <ArrowUpCircle className="h-3 w-3 mr-1" /> {formatCurrency(report.totalIncome || 0)}
                              </div>
                              <div className="text-[10px] font-black text-rose-600 flex items-center">
                                <ArrowDownCircle className="h-3 w-3 mr-1" /> {formatCurrency(report.totalExpense || 0)}
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => reprintReport(report)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 text-emerald-600 hover:bg-emerald-50"
                              asChild
                            >
                              <a href={report.fileUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}