'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  FileText,
  Mail,
  Loader2,
  Calendar,
  MapPin,
  Send,
  Download,
  CheckCircle2,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Paperclip
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdminLayout } from '@/components/layout/admin-layout'
import { useSession } from 'next-auth/react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { StatusPopup } from '@/components/ui/status-popup'
import { useStatusPopup } from '@/lib/hooks/use-status-popup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { 
  PageCover, 
  Page1, 
  Page2, 
  Page3, 
  Page4, 
  Page5, 
  Page6
} from '@/components/persuratan/proposal-pdf-preview'

export default function PersuratanAdmin() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('PROPOSAL')
  const { statusProps, showSuccess, showError} = useStatusPopup()
  
  // Check if user can validate documents
  const canValidate = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Tokoh Masyarakat'].includes(session.user.role)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/persuratan')
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch (error) {
      showError('Gagal', 'Terjadi kesalahan saat mengambil data dokumen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleValidate = async (id: string, action: 'validate' | 'reject') => {
    try {
      const rejectionNote = action === 'reject' ? prompt('Alasan penolakan:') : null
      if (action === 'reject' && !rejectionNote) return

      const res = await fetch(`/api/admin/persuratan/${id}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionNote })
      })

      if (res.ok) {
        showSuccess('Berhasil!', `Dokumen berhasil ${action === 'validate' ? 'divalidasi' : 'ditolak'}.`)
        fetchData()
      } else {
        showError('Gagal', `Gagal ${action === 'validate' ? 'memvalidasi' : 'menolak'} dokumen.`)
      }
    } catch (error) {
      showError('Error', 'Terjadi kesalahan sistem.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return
    
    try {
      const res = await fetch(`/api/admin/persuratan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showSuccess('Berhasil!', 'Dokumen berhasil dihapus.')
        fetchData()
      } else {
        showError('Gagal', 'Gagal menghapus dokumen.')
      }
    } catch (error) {
      showError('Gagal', 'Gagal menghapus dokumen.')
    }
  }

  const filteredData = data.filter(item => 
    item.type === activeTab &&
    (item.title.toLowerCase().includes(search.toLowerCase()) ||
     item.nomorSurat?.toLowerCase().includes(search.toLowerCase()))
  )

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activePDFData, setActivePDFData] = useState<any>(null)

  const generatePDF = async (item: any) => {
    if (item.type !== 'PROPOSAL') {
        // Fallback to old manual generation for other types for now
        return generateManualPDF(item)
    }

    try {
      setIsGeneratingPDF(true)
      setActivePDFData(item)
      toast.info('Menyiapkan render PDF premium...')

      // Wait for React to render the hidden preview
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const previewContainer = document.getElementById('hidden-proposal-preview')
      if (!previewContainer) throw new Error('Preview container not found')

      const doc = new jsPDF('p', 'mm', 'a4')
      const pages = previewContainer.querySelectorAll('.proposal-page')
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        const canvas = await html2canvas(page, {
          scale: 2.5, // High quality
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          logging: false
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        if (i > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      }

      const fileName = `Proposal_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      doc.save(fileName)
      toast.success('PDF Proposal premium berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal membuat PDF premium')
    } finally {
      setIsGeneratingPDF(false)
      setActivePDFData(null)
    }
  }

  const generateManualPDF = async (item: any) => {
    try {
      // Create PDF with A4 size
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const dkmEmerald = [11, 61, 46] // #0b3d2e
      const dkmGold = [158, 115, 30] // #9e731e
      const dkmSlate = [15, 23, 42] // #0f172a
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const centerX = pageWidth / 2
      const margin = 15

      // Parse Content if JSON
      let formData: any = {}
      try {
        formData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      } catch (e) {
        formData = { content: item.content }
      }

      // --- 1. PREMIUM HEADER / KOP ---
      // Decorative side bar
      doc.setFillColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.rect(0, 0, 5, pageHeight, 'F')
      
      // Header Line
      doc.setFillColor(dkmGold[0], dkmGold[1], dkmGold[2])
      doc.rect(margin, 10, pageWidth - (margin * 2), 0.5, 'F')
      
      // DKM Text
      doc.setFontSize(14)
      doc.setFont('times', 'bold')
      doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.text('DEWAN KEMAKMURAN MASJID (DKM)', centerX, 22, { align: 'center' })
      
      doc.setFontSize(22)
      doc.text('AL-MUHAJIRIN RAGAS GRENYANG', centerX, 32, { align: 'center' })
      
      doc.setFontSize(9)
      doc.setFont('times', 'italic')
      doc.setTextColor(148, 163, 184)
      doc.text('Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten', centerX, 38, { align: 'center' })
      doc.text('Email: dkm.almuhajirin.ragas@gmail.com | Website: dkm-almuhajirin.vercel.app', centerX, 43, { align: 'center' })
      
      doc.setDrawColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.setLineWidth(0.8)
      doc.line(margin, 48, pageWidth - margin, 48)
      doc.setLineWidth(0.2)
      doc.line(margin, 50, pageWidth - margin, 50)

      let curY = 65
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])

      // --- 2. DOCUMENT INFO ---
      const dateStr = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      doc.text(`${item.location || 'Bojonegara'}, ${dateStr}`, pageWidth - margin, curY, { align: 'right' })
      
      doc.text(`Nomor      : ${item.nomorSurat || '-'}`, margin, curY)
      doc.text(`Lampiran  : -`, margin, curY + 6)
      doc.setFont('times', 'bold')
      doc.text(`Perihal      : ${item.title.toUpperCase()}`, margin, curY + 12)
      
      curY += 25

      // Recipient Section
      if (item.recipient) {
        doc.setFont('times', 'normal')
        doc.text('Kepada Yth.', margin, curY)
        doc.setFont('times', 'bold')
        doc.text(item.recipient, margin, curY + 6)
        
        if (formData.penerimaJabatan) {
          doc.setFont('times', 'italic')
          doc.setFontSize(10)
          doc.text(formData.penerimaJabatan, margin, curY + 11)
          doc.setFontSize(11)
        }

        doc.setFont('times', 'normal')
        doc.text('di -', margin, curY + (formData.penerimaJabatan ? 17 : 12))
        doc.text(item.location || 'Tempat', margin + 5, curY + (formData.penerimaJabatan ? 22 : 18))
        curY += 35
      }

      // --- 3. GREETING ---
      doc.setFont('times', 'normal')
      doc.text('Assalamu\'alaikum Warahmatullahi Wabarakatuh,', margin, curY)
      curY += 10

      // --- 4. CONTENT RENDERING ---
      const renderContent = (text: string, fontSize = 11, fontStyle: any = 'normal') => {
        if (!text) return
        doc.setFont('times', fontStyle)
        doc.setFontSize(fontSize)
        const maxWidth = pageWidth - (margin * 2)
        const split = doc.splitTextToSize(text, maxWidth)
        doc.text(split, margin, curY, { align: 'justify', lineHeightFactor: 1.5 })
        curY += (split.length * 6) + 3
      }

      // If it's a proposal from the builder, it might have specific structure
      if (item.type === 'PROPOSAL') {
        const pData = formData
        renderContent(pData.suratPengantar || pData.perihal || item.title)
      } else {
        // Standard Letter types (Undangan, Surat Resmi)
        if (formData.isiSuratPengantar) renderContent(formData.isiSuratPengantar)
        
        if (formData.latarBelakang) {
          renderContent('Dasar Pemikiran:', 11, 'bold')
          renderContent(formData.latarBelakang)
        }

        if (formData.maksudTujuanList && Array.isArray(formData.maksudTujuanList) && formData.maksudTujuanList.length > 0) {
          renderContent('Maksud dan Tujuan:', 11, 'bold')
          formData.maksudTujuanList.forEach((point: string, idx: number) => {
            const maxWidth = pageWidth - (margin * 2) - 5
            const splitPoint = doc.splitTextToSize(`${idx + 1}. ${point}`, maxWidth)
            doc.text(splitPoint, margin + 5, curY)
            curY += (splitPoint.length * 6)
          })
          curY += 3
        }

        // Fallback if no specific fields
        if (!formData.isiSuratPengantar && !formData.latarBelakang) {
          renderContent(item.content || item.title)
        }
      }

      // Closing
      doc.setFont('times', 'normal')
      doc.setFontSize(11)
      if (curY > pageHeight - 60) { 
        doc.addPage()
        curY = 30
      }
      
      const closingText = doc.splitTextToSize('Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.', pageWidth - (margin * 2))
      doc.text(closingText, margin, curY)
      curY += (closingText.length * 6) + 3
      doc.text('Wassalamu\'alaikum Warahmatullahi Wabarakatuh,', margin, curY)
      curY += 10
      
      // --- 5. SIGNATURE BLOCK ---
      if (curY > pageHeight - 50) { 
        doc.addPage()
        curY = 30
      }

      doc.setFont('times', 'bold')
      const colLeft = 50
      const colRight = pageWidth - 50

      const ketuaName = formData.namaKetua || formData.ttdKetuaDKM || 'H. AGUNG GUNAWAN'
      const sekretarisName = formData.namaSekretaris || formData.ttdSekretarisDKM || '..........................'

      doc.text('Ketua DKM,', colLeft, curY, { align: 'center' })
      doc.text('Sekretaris,', colRight, curY, { align: 'center' })
      
      doc.setDrawColor(200)
      doc.line(colLeft - 25, curY + 22, colLeft + 25, curY + 22)
      doc.line(colRight - 25, curY + 22, colRight + 25, curY + 22)
      
      doc.text(ketuaName, colLeft, curY + 28, { align: 'center' })
      doc.text(sekretarisName, colRight, curY + 28, { align: 'center' })

      // Generate filename
      const filename = `${item.type}_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      
      // Use blob method for better download reliability
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('PDF berhasil diunduh!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Gagal mengunduh PDF')
    }
  }

  return (
    <AdminLayout title="Administrasi & Persuratan" subtitle="Pembuatan Proposal, Undangan, dan Surat Resmi DKM.">
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header Stats */}
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-blue-50 to-indigo-50/30">
            <CardContent className="p-3 md:p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-2 md:gap-0">
                <div>
                  <p className="text-[7px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest leading-tight">Total Proposal</p>
                  <h3 className="text-lg md:text-3xl font-black text-[#0b3d2e] mt-1">{data.filter(d => d.type === 'PROPOSAL').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                  <FileText className="h-4 w-4 md:h-6 md:w-6" />
                </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-emerald-50 to-teal-50/30">
            <CardContent className="p-3 md:p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-2 md:gap-0">
                <div>
                  <p className="text-[7px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-tight">Surat Undangan</p>
                  <h3 className="text-lg md:text-3xl font-black text-[#0b3d2e] mt-1">{data.filter(d => d.type === 'UNDANGAN').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                  <Mail className="h-4 w-4 md:h-6 md:w-6" />
                </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-amber-50 to-orange-50/30">
            <CardContent className="p-3 md:p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-2 md:gap-0">
                <div>
                  <p className="text-[7px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-tight">Surat Resmi</p>
                  <h3 className="text-lg md:text-3xl font-black text-[#0b3d2e] mt-1">{data.filter(d => d.type === 'SURAT_RESMI').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                  <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" />
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
            <TabsList className="bg-white border rounded-2xl md:rounded-3xl p-1 h-14 md:h-16 shadow-sm w-full lg:w-auto grid grid-cols-3 md:flex overflow-x-auto">
              <TabsTrigger value="PROPOSAL" className="rounded-xl px-4 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white uppercase tracking-wider">Proposal</TabsTrigger>
              <TabsTrigger value="UNDANGAN" className="rounded-xl px-4 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white uppercase tracking-wider">Undangan</TabsTrigger>
              <TabsTrigger value="SURAT_RESMI" className="rounded-xl px-4 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white uppercase tracking-wider">Resmi</TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href={activeTab === 'PROPOSAL' ? '/admin/persuratan/proposal/buat' : `/admin/persuratan/buat?type=${activeTab}`} className="w-full sm:w-auto">
            <Button className="rounded-2xl h-14 md:h-16 px-8 md:px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-[#0b3d2e] hover:bg-[#062c21] w-full">
              <Plus className="h-5 w-5 mr-3" />
              Buat {activeTab === 'PROPOSAL' ? 'Proposal' : activeTab === 'UNDANGAN' ? 'Undangan' : 'Surat'}
            </Button>
          </Link>
        </div>

        {/* List of Documents */}
        <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
          <CardHeader className="p-6 md:p-10 border-b border-gray-50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-[#0b3d2e] text-white flex items-center justify-center shrink-0">
                  <History className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl font-black text-[#0b3d2e]">Riwayat Persuratan</CardTitle>
                  <p className="text-[10px] md:text-xs text-neutral-400 font-medium tracking-tight">Daftar {activeTab.toLowerCase()} yang telah diterbitkan.</p>
                </div>
              </div>
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <Input 
                  placeholder="Cari perihal atau nomor surat..." 
                  className="pl-14 h-12 md:h-14 rounded-2xl bg-neutral-50/50 border-transparent focus:bg-white focus:border-emerald-100 transition-all text-sm font-medium"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-20 md:p-32">
                <Loader2 className="animate-spin h-10 w-10 md:h-12 md:w-12 text-[#0b3d2e]" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20 md:py-32 px-6">
                <div className="h-16 w-16 md:h-24 md:w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 md:h-10 md:w-10 text-gray-200" />
                </div>
                <p className="text-base md:text-lg font-bold text-gray-300 italic">Belum ada dokumen {activeTab.toLowerCase()}</p>
              </div>
            ) : (
              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {filteredData.map((item) => (
                    <Card key={item.id} className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 bg-white border border-slate-50">
                      
                      <CardContent className="p-8 space-y-6">
                        {/* Status Header */}
                        <div className="flex justify-between items-center">
                           <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border-none ${
                             item.type === 'PROPOSAL' ? 'bg-indigo-50 text-indigo-600' : 
                             item.type === 'UNDANGAN' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {item.type}
                           </Badge>
                           <StatusBadge status={item.status} />
                        </div>

                        {/* Title Section */}
                        <div className="space-y-2">
                           <h4 className="font-black text-[#5e17eb] text-xl leading-tight transition-colors line-clamp-2">
                             {item.title}
                           </h4>
                           {item.nomorSurat && (
                             <p className="text-[11px] font-bold text-slate-400 tracking-wider">
                               {item.nomorSurat}
                             </p>
                           )}
                        </div>

                        {/* Detail Info */}
                        <div className="space-y-4 pt-2">
                           <div className="flex items-center gap-3 text-slate-600">
                             <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                               <Send className="h-4 w-4 text-slate-400" />
                             </div>
                             <p className="text-sm font-medium text-slate-600 line-clamp-1">
                               {item.recipient || 'Tanpa Penerima'}
                             </p>
                           </div>

                           <div className="flex items-center gap-3 text-slate-600">
                             <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                               <Calendar className="h-4 w-4 text-slate-400" />
                             </div>
                             <p className="text-sm font-medium text-slate-600">
                               {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                             </p>
                           </div>
                        </div>

                        {/* Footer Divider (Subtle) */}
                        <div className="h-px w-full bg-slate-50" />

                        {/* Bottom Row: Author & Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                           <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#5e17eb] font-black text-sm border-2 border-white shadow-sm shrink-0">
                                {item.creator?.name?.charAt(0) || 'D'}
                              </div>
                              <p className="text-xs font-bold text-slate-400">
                                <span className="font-medium mr-1 uppercase text-[10px]">By</span> 
                                <span className="text-slate-500 font-bold">{item.creator?.name || 'DKM Admin'}</span>
                              </p>
                           </div>

                           <div className="flex items-center gap-1 justify-end w-full sm:w-auto">
                              {/* Validation Actions for Admins */}
                              {canValidate && item.status === 'pending' && (
                                <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-100">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => handleValidate(item.id, 'validate')}
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-10 w-10 rounded-xl text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleValidate(item.id, 'reject')}
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </Button>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
                                onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}&mode=view` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}&mode=view`)}
                                title="Lihat Detail"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={item.status !== 'validated'}
                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all duration-300"
                                onClick={() => generatePDF(item)}
                                title="Unduh PDF"
                              >
                                <Download className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
                                onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}`)}
                                title="Edit Dokumen"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
                                onClick={() => handleDelete(item.id)}
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <StatusPopup {...statusProps} />

      {/* Hidden Preview Container for PDF Generation */}
      <div style={{ position: 'fixed', left: '-5000px', top: 0, zIndex: -1 }}>
        <div id="hidden-proposal-preview">
          {activePDFData && (() => {
            const formData = typeof activePDFData.content === 'string' 
              ? JSON.parse(activePDFData.content) 
              : activePDFData.content;
            
            return (
              <div className="flex flex-col gap-0 font-serif" style={{ width: '794px' }}>
                <PageCover data={formData} />
                <Page1 data={formData} />
                <Page2 data={formData} />
                <Page3 data={formData} />
                <Page4 data={formData} />
                <Page5 data={formData} />
                {formData.lampiranFoto?.length > 0 && <Page6 data={formData} />}
              </div>
            )
          })()}
        </div>
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'validated') return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none shrink-0">
       TERVALIDASI
    </Badge>
  )
  if (status === 'rejected') return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-rose-50 text-rose-600 border-none shrink-0">
       DITOLAK
    </Badge>
  )
  return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border-none shrink-0">
       MENUNGGU_VALIDASI
    </Badge>
  )
}
