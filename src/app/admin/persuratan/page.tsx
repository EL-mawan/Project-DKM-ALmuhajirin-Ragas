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
  Paperclip,
  MoreHorizontal,
  Check,
  X,
  MailOpen
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    try {
      setIsGeneratingPDF(true)
      setActivePDFData(item)
      toast.info(`Menyiapkan render PDF ${item.type.toLowerCase()}...`)

      // Wait for React to render the hidden preview
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const previewContainer = document.getElementById('hidden-proposal-preview')
      if (!previewContainer) throw new Error('Preview container not found')

      const doc = new jsPDF('p', 'mm', 'a4')
      const pages = previewContainer.querySelectorAll('.proposal-page')
      
      if (pages.length === 0) {
        // Fallback if no pages found (e.g. not a proposal or component failure)
        return generateManualPDF(item)
      }

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        const canvas = await html2canvas(page, {
          scale: 2.5, // High quality
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          logging: false,
          onclone: (clonedDoc: Document) => {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              :root {
                --background: #fafafa;
                --foreground: #262626;
                --primary: #0b3d2e;
                --primary-foreground: #fafafa;
                --muted: #f5f5f5;
                --muted-foreground: #737373;
                --border: #e5e5e5;
                --input: #f0f0f0;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        if (i > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      }

      const fileName = `${item.type}_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      doc.save(fileName)
      toast.success('PDF berhasil diunduh')
    } catch (error) {
      console.error(error)
      toast.error('Gagal membuat PDF premium, menggunakan metode standar...')
      generateManualPDF(item)
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
      const margin = 20

      // Parse Content if JSON
      let formData: any = {}
      try {
        formData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      } catch (e) {
        formData = { content: item.content }
      }

      // --- 1. PREMIUM HEADER / KOP ---
      // DKM Text
      doc.setFontSize(14)
      doc.setFont('times', 'bold')
      doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.text(formData.namaKopSurat?.split('\n')[0] || 'DEWAN KEMAKMURAN MASJID (DKM)', centerX, 22, { align: 'center' })
      
      doc.setFontSize(18)
      doc.text(formData.namaKopSurat?.split('\n')[1] || 'AL-MUHAJIRIN KP. RAGAS GRENYANG', centerX, 30, { align: 'center' })
      
      doc.setFontSize(9)
      doc.setFont('times', 'italic')
      doc.setTextColor(100, 116, 139)
      const alamatLines = doc.splitTextToSize(formData.alamatKopSurat || 'Desa Argawana, Kecamatan Puloampel Kabupaten Serang Provinsi Banten 42455', pageWidth - 60)
      doc.text(alamatLines, centerX, 36, { align: 'center' })
      
      doc.setDrawColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.setLineWidth(1)
      doc.line(margin, 48, pageWidth - margin, 48)
      doc.setLineWidth(0.2)
      doc.line(margin, 49.5, pageWidth - margin, 49.5)

      let curY = 60
      doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])

      // --- 2. DOCUMENT INFO ---
      const dateStr = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.setFont('times', 'bold')
      doc.setFontSize(11)
      doc.text(`${item.location || 'Argawana'}, ${dateStr}`, pageWidth - margin, curY, { align: 'right' })
      
      doc.setFont('times', 'normal')
      doc.text(`Nomor      : ${item.nomorSurat || '-'}`, margin, curY)
      doc.text(`Lampiran  : ${formData.lampiran || '-'}`, margin, curY + 6)
      doc.setFont('times', 'bold')
      doc.text(`Perihal      : ${item.title.toUpperCase()}`, margin, curY + 12)
      
      curY += 25

      // Recipient Section
      doc.setFont('times', 'normal')
      doc.text('Kepada Yth.', margin, curY)
      doc.setFont('times', 'bold')
      doc.text(item.recipient || '............................', margin, curY + 6)
      
      if (formData.penerimaJabatan) {
        doc.setFont('times', 'italic')
        doc.setFontSize(10)
        doc.text(formData.penerimaJabatan, margin, curY + 11)
        doc.setFontSize(11)
      }

      doc.setFont('times', 'normal')
      doc.text('di_', margin, curY + (formData.penerimaJabatan ? 17 : 12))
      doc.setFont('times', 'bold')
      doc.text(formData.penerimaLokasi || 'Tempat', margin + 5, curY + (formData.penerimaJabatan ? 22 : 18))
      curY += 35

      // --- 4. CONTENT RENDERING ---
      const renderContent = (text: string, fontSize = 11, fontStyle: any = 'normal') => {
        if (!text) return
        doc.setFont('times', fontStyle)
        doc.setFontSize(fontSize)
        const maxWidth = pageWidth - (margin * 2)
        const split = doc.splitTextToSize(text, maxWidth)
        doc.text(split, margin, curY, { align: 'justify', lineHeightFactor: 1.5 })
        curY += (split.length * 7) + 3
      }

      // Handle both Builder Schema and old schema
      const pembuka = formData.pembuka || formData.isiSuratPengantar || ''
      const penutup = formData.penutup || formData.kalimatPenutup || ''

      renderContent(pembuka)

      // Event Details for Undangan/Surat
      if (formData.waktuTempatAktif) {
        const detailsX = margin + 15
        doc.setFont('times', 'normal')
        
        const rows = [
          ['Hari, Tanggal', `: ${formData.hariAcara || ''}${formData.hariAcara && formData.tanggalAcara ? ', ' : ''}${formData.tanggalAcara || ''}`],
          ['Waktu', `: ${formData.waktuAcara || ''}`],
          ['Tempat', `: ${formData.lokasiAcara || ''}`],
          ['Acara', `: ${formData.namaAcara || ''}`]
        ]

        rows.forEach(([label, value]) => {
          doc.text(label, detailsX, curY)
          doc.text(value, detailsX + 35, curY)
          curY += 7
        })
        curY += 5
      }

      renderContent(penutup)

      // Signature Block
      if (curY > pageHeight - 60) { 
        doc.addPage()
        curY = 30
      } else {
        curY += 10
      }

      const colLeft = 55
      const colRight = pageWidth - 55

      doc.setFont('times', 'bold')
      doc.text('Sekretaris DKM,', colLeft, curY, { align: 'center' })
      doc.text('Ketua DKM,', colRight, curY, { align: 'center' })
      
      curY += 25
      doc.text(`( ${formData.ttdSekretarisDKM || '............................'} )`, colLeft, curY, { align: 'center' })
      doc.text(`( ${formData.ttdKetuaDKM || '............................'} )`, colRight, curY, { align: 'center' })

      if (formData.ttdTokohMasyarakat) {
        curY += 15
        doc.setFontSize(10)
        doc.text('Mengetahui,', centerX, curY, { align: 'center' })
        doc.text('Tokoh Masyarakat Masjid Al-Muhajirin', centerX, curY + 5, { align: 'center' })
        curY += 25
        doc.text(`( ${formData.ttdTokohMasyarakat} )`, centerX, curY, { align: 'center' })
      }

      // Generate filename
      const filename = `${item.type}_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      doc.save(filename)
      toast.success('PDF berhasil diunduh!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Gagal mengunduh PDF')
    }
  }

  // Generate Envelope (110 x 230 mm) for Undangan and Surat Resmi
  const generateEnvelope = (item: any) => {
    if (item.type === 'PROPOSAL') {
      toast.error('Amplop hanya tersedia untuk Undangan dan Surat Resmi')
      return
    }

    try {
      // 110mm x 230mm in points (1mm = 2.83465 points)
      const width = 110 * 2.83465  // ~311.8 points
      const height = 230 * 2.83465 // ~652 points
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [height, width]
      })

      const dkmEmerald = [11, 61, 46]
      const dkmGold = [158, 115, 30]
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 30

      // Parse recipient data
      let formData: any = {}
      try {
        formData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      } catch (e) {
        formData = {}
      }

      // Left side: DKM Letterhead
      let curY = margin + 20
      
      // Logo placeholder (decorative bar)
      doc.setFillColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.rect(margin, margin, 3, pageHeight - (margin * 2), 'F')
      
      // DKM Header
      doc.setFont('times', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.text('DEWAN KEMAKMURAN MASJID (DKM)', margin + 10, curY)
      
      curY += 10
      doc.setFontSize(11)
      doc.text('AL-MUHAJIRIN KP. RAGAS GRENYANG', margin + 10, curY)
      
      curY += 10
      doc.setFontSize(7)
      doc.setFont('times', 'italic')
      doc.setTextColor(100, 100, 100)
      doc.text('Desa Argawana, Kecamatan Puloampel', margin + 10, curY)
      curY += 8
      doc.text('Kabupaten Serang Provinsi Banten 42455', margin + 10, curY)
      
      curY += 15
      doc.setDrawColor(dkmGold[0], dkmGold[1], dkmGold[2])
      doc.setLineWidth(1)
      doc.line(margin + 10, curY, margin + 200, curY)

      // Document Info
      curY += 20
      doc.setFont('times', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(50, 50, 50)
      doc.text(`Nomor: ${item.nomorSurat || '-'}`, margin + 10, curY)
      curY += 12
      doc.setFont('times', 'bold')
      doc.text(`Perihal: ${item.title}`, margin + 10, curY)

      // Right side: Recipient Address Box
      const boxX = pageWidth - margin - 220
      const boxY = pageHeight / 2 - 60
      const boxWidth = 200
      const boxHeight = 120
      
      // Draw recipient box with border
      doc.setDrawColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.setLineWidth(2)
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 5, 5, 'S')
      
      // "Kepada Yth." label
      doc.setFont('times', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
      doc.text('Kepada Yth.', boxX + 10, boxY + 20)
      
      // Recipient name
      doc.setFont('times', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      const recipientName = item.recipient || 'Penerima'
      const nameLines = doc.splitTextToSize(recipientName, boxWidth - 20)
      doc.text(nameLines, boxX + 10, boxY + 35)
      
      let addressY = boxY + 35 + (nameLines.length * 12)
      
      // Recipient position/title
      if (formData.penerimaJabatan) {
        doc.setFont('times', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(80, 80, 80)
        const titleLines = doc.splitTextToSize(formData.penerimaJabatan, boxWidth - 20)
        doc.text(titleLines, boxX + 10, addressY)
        addressY += titleLines.length * 10
      }
      
      // "di -" and location
      addressY += 5
      doc.setFont('times', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text('di -', boxX + 10, addressY)
      addressY += 12
      doc.setFont('times', 'bold')
      doc.text(item.location || 'Tempat', boxX + 15, addressY)

      // Save the envelope
      const filename = `Amplop_${item.type}_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      doc.save(filename)
      toast.success('Amplop berhasil diunduh!')
    } catch (error) {
      console.error('Error generating envelope:', error)
      toast.error('Gagal membuat amplop')
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
                        {/* Top Section: Badges & Actions */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-2">
                             <Badge className={`rounded-xl px-3 py-1 font-black text-[9px] w-fit uppercase tracking-widest border-none ${
                               item.type === 'PROPOSAL' ? 'bg-indigo-50 text-indigo-600' : 
                               item.type === 'UNDANGAN' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                             }`}>
                               {item.type}
                             </Badge>
                             <StatusBadge status={item.status} />
                          </div>

                          <div className="flex items-center gap-2">
                             {/* Primary Action Button (View) - Desktop Only */}
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="hidden md:flex h-10 w-10 rounded-2xl bg-white shadow-sm hover:shadow-md hover:bg-white text-indigo-600 transition-all duration-300"
                               onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}&mode=view` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}&mode=view`)}
                               title="Lihat Detail"
                             >
                               <Eye className="h-5 w-5" />
                             </Button>

                             {/* Kebab Menu - All Actions */}
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                                   <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl">
                                 <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 px-3 py-2">Opsi Dokumen</DropdownMenuLabel>
                                 
                                 {canValidate && item.status === 'pending' && (
                                   <>
                                     <DropdownMenuItem 
                                       onClick={() => handleValidate(item.id, 'validate')} 
                                       className="rounded-xl h-11 px-3 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer font-bold transition-colors"
                                     >
                                       <CheckCircle className="h-4 w-4 mr-3" />
                                       Validasi Sekarang
                                     </DropdownMenuItem>
                                     <DropdownMenuItem 
                                       onClick={() => handleValidate(item.id, 'reject')} 
                                       className="rounded-xl h-11 px-3 text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer font-bold transition-colors"
                                     >
                                       <XCircle className="h-4 w-4 mr-3" />
                                       Tolak Dokumen
                                     </DropdownMenuItem>
                                     <DropdownMenuSeparator className="my-2 bg-slate-50" />
                                   </>
                                 )}

                                 <DropdownMenuItem 
                                   onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}&mode=view` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}&mode=view`)}
                                   className="rounded-xl h-11 px-3 cursor-pointer font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                                 >
                                   <Eye className="h-4 w-4 mr-3 text-indigo-500" />
                                   Lihat Detail
                                 </DropdownMenuItem>

                                 {(item.type === 'UNDANGAN' || item.type === 'SURAT_RESMI') && (
                                   <DropdownMenuItem 
                                     onClick={() => generateEnvelope(item)}
                                     className="rounded-xl h-11 px-3 cursor-pointer font-bold text-slate-600 hover:text-purple-600 transition-colors"
                                   >
                                     <MailOpen className="h-4 w-4 mr-3 text-purple-500" />
                                     Cetak Amplop
                                   </DropdownMenuItem>
                                 )}

                                 <DropdownMenuItem 
                                   onClick={() => generatePDF(item)}
                                   disabled={item.status !== 'validated'}
                                   className="rounded-xl h-11 px-3 cursor-pointer font-bold text-slate-600 hover:text-blue-600 transition-colors"
                                 >
                                   <Download className="h-4 w-4 mr-3 text-blue-500" />
                                   Download PDF
                                 </DropdownMenuItem>

                                 <DropdownMenuItem 
                                   onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}`)} 
                                   className="rounded-xl h-11 px-3 cursor-pointer font-bold text-slate-600 hover:text-emerald-600 transition-colors"
                                 >
                                   <Edit2 className="h-4 w-4 mr-3 text-emerald-500" />
                                   Edit Konten
                                 </DropdownMenuItem>

                                 <DropdownMenuSeparator className="my-2 bg-slate-50" />

                                 <DropdownMenuItem 
                                   onClick={() => handleDelete(item.id)} 
                                   className="rounded-xl h-11 px-3 text-rose-400 focus:text-rose-600 focus:bg-rose-50 cursor-pointer font-bold transition-colors"
                                 >
                                   <Trash2 className="h-4 w-4 mr-3" />
                                   Hapus Permanen
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-3">
                           <h4 className="font-black text-[#0b3d2e] text-xl leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                             {item.title}
                           </h4>
                           {item.nomorSurat ? (
                             <div className="flex items-center gap-2">
                               <Paperclip className="h-3 w-3 text-slate-300" />
                               <p className="text-[11px] font-bold text-slate-400 tracking-wider">
                                 {item.nomorSurat}
                               </p>
                             </div>
                           ) : (
                             <div className="h-4" /> // Spacer to keep height consistent
                           )}
                        </div>

                        {/* Detail Info */}
                        <div className="bg-slate-50/30 rounded-3xl p-5 space-y-3 border border-slate-50">
                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                               <Send className="h-3.5 w-3.5 text-slate-400" />
                             </div>
                             <p className="text-xs font-bold text-slate-600 line-clamp-1">
                               {item.recipient || 'Tanpa Penerima'}
                             </p>
                           </div>

                           <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                               <Calendar className="h-3.5 w-3.5 text-slate-400" />
                             </div>
                             <p className="text-xs font-bold text-slate-600">
                               {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                             </p>
                           </div>
                        </div>

                        {/* Bottom Row: Author */}
                        <div className="flex items-center justify-between pt-2">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#5e17eb] font-black text-xs border-2 border-white shadow-sm shrink-0">
                                {item.creator?.name?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Diterbitkan Oleh</p>
                                <p className="text-[11px] font-bold text-slate-500">{item.creator?.name || 'DKM Admin'}</p>
                              </div>
                           </div>
                           
                           {/* Decorative icon based on type */}
                           <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                             {item.type === 'PROPOSAL' ? <FileText className="h-5 w-5 text-indigo-400" /> : 
                              item.type === 'UNDANGAN' ? <Mail className="h-5 w-5 text-emerald-400" /> : 
                              <CheckCircle2 className="h-5 w-5 text-amber-400" />}
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
            
            if (activePDFData.type === 'PROPOSAL') {
              return (
                <div className="flex flex-col gap-0 font-serif" style={{ width: '794px' }}>
                  <PageCover data={formData} />
                  <Page1 data={formData} />
                  <Page2 data={formData} />
                  <Page3 data={formData} />
                  <Page4 data={formData} />
                  <Page5 data={formData} />
                  {formData.lampiranFoto && formData.lampiranFoto.length > 0 && <Page6 data={formData} />}
                </div>
              )
            } else {
              // Undangan / Surat Resmi Premium Layout
              return (
                <div className="proposal-page relative flex flex-col" 
                     style={{ 
                       width: '794px', 
                       height: '1123px', 
                       padding: '60px 80px', 
                       boxSizing: 'border-box',
                       background: 'white',
                       fontFamily: "'Times New Roman', Times, serif"
                     }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid #0b3d2e', paddingBottom: '15px', marginBottom: '30px' }}>
                    <img src="/logo.png" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                    <div style={{ flex: 1, textAlign: 'center', paddingRight: '40px' }}>
                      <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0, color: '#0b3d2e', textTransform: 'uppercase' }}>{formData.namaKopSurat || 'DKM AL-MUHAJIRIN'}</h1>
                      <p style={{ fontSize: '10pt', margin: '5px 0' }}>{formData.alamatKopSurat}</p>
                      <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#64748b' }}>{formData.kontakKopSurat}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '12pt' }}>
                    <div>
                      <p>Nomor : {activePDFData.nomorSurat}</p>
                      <p>Lampiran : {formData.lampiran || '-'}</p>
                      <p>Perihal : <span style={{ fontWeight: 'bold' }}>{activePDFData.title.toUpperCase()}</span></p>
                    </div>
                    <p style={{ fontWeight: 'bold' }}>{activePDFData.location}, {new Date(activePDFData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>

                  {/* Recipient */}
                  <div style={{ marginBottom: '40px', fontSize: '12pt' }}>
                    <p>Kepada Yth.</p>
                    <p style={{ fontWeight: 'bold', fontSize: '13pt' }}>{activePDFData.recipient}</p>
                    <p style={{ fontStyle: 'italic' }}>{formData.penerimaJabatan}</p>
                    <p style={{ marginTop: '10px' }}>di - <span style={{ fontWeight: 'bold' }}>{formData.penerimaLokasi || 'Tempat'}</span></p>
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, fontSize: '12pt', lineHeight: 1.6, textAlign: 'justify' }}>
                    <p style={{ marginBottom: '20px' }}>{formData.pembuka || formData.isiSuratPengantar}</p>
                    
                    {formData.waktuTempatAktif && (
                      <div style={{ marginLeft: '60px', marginBottom: '20px' }}>
                        <table style={{ width: '100%' }}>
                          <tbody>
                            <tr><td style={{ width: '120px' }}>Hari, Tanggal</td><td>: {formData.hariAcara}, {formData.tanggalAcara}</td></tr>
                            <tr><td>Waktu</td><td>: {formData.waktuAcara}</td></tr>
                            <tr><td>Tempat</td><td>: {formData.lokasiAcara}</td></tr>
                            <tr><td>Acara</td><td>: {formData.namaAcara}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p>{formData.penutup || formData.kalimatPenutup}</p>
                  </div>

                  {/* Signature */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', fontSize: '12pt', marginTop: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                      <p style={{ fontWeight: 'bold' }}>SEKRETARIS DKM,</p>
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{formData.ttdSekretarisDKM || '........................'}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                      <p style={{ fontWeight: 'bold' }}>KETUA DKM,</p>
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{formData.ttdKetuaDKM || '........................'}</p>
                    </div>
                  </div>
                </div>
              )
            }
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
