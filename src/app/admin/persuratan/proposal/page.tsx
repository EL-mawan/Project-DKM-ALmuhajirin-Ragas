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
import { toast } from 'sonner'
import jsPDF from 'jspdf'

export default function PersuratanProposal() {
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

  const generatePDF = (item: any) => {
    const doc = new jsPDF()
    const dkmEmerald = [11, 61, 46] // #0b3d2e
    const dkmGold = [158, 115, 30] // #9e731e
    const dkmSlate = [15, 23, 42] // #0f172a
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2

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
    doc.rect(0, 0, 5, 297, 'F')
    
    // Header Line
    doc.setFillColor(dkmGold[0], dkmGold[1], dkmGold[2])
    doc.rect(15, 10, 180, 0.5, 'F')
    
    // DKM Text
    doc.setFontSize(12)
    doc.setFont('times', 'bold')
    doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
    doc.text('DEWAN KEMAKMURAN MASJID (DKM)', centerX, 22, { align: 'center', charSpace: 1 })
    
    doc.setFontSize(18)
    doc.text('AL-MUHAJIRIN RAGAS GRENYANG', centerX, 32, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('times', 'italic')
    doc.setTextColor(148, 163, 184)
    doc.text('Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten', centerX, 38, { align: 'center' })
    doc.setFontSize(9)
    doc.text('Email: dkm.almuhajirin.ragas@gmail.com | Website: dkm-almuhajirin.vercel.app', centerX, 43, { align: 'center' })
    
    doc.setDrawColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
    doc.setLineWidth(0.8)
    doc.line(15, 48, 195, 48)
    doc.setLineWidth(0.2)
    doc.line(15, 50, 195, 50)

    let curY = 65
    doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])

    // --- 2. DOCUMENT INFO ---
    const dateStr = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    doc.text(`${item.location || 'Bojonegara'}, ${dateStr}`, 195, curY, { align: 'right' })
    
    doc.text(`Nomor      : ${item.nomorSurat || '-'}`, 15, curY)
    doc.text(`Lampiran  : -`, 15, curY + 6)
    doc.setFont('times', 'bold')
    doc.text(`Perihal      : ${item.title.toUpperCase()}`, 15, curY + 12)
    
    curY += 25

    // Recipient Section
    if (item.recipient) {
      doc.setFont('times', 'normal')
      doc.text('Kepada Yth.', 15, curY)
      doc.setFont('times', 'bold')
      doc.text(item.recipient, 15, curY + 6)
      
      if (formData.penerimaJabatan) {
        doc.setFont('times', 'italic')
        doc.setFontSize(10)
        doc.text(formData.penerimaJabatan, 15, curY + 11)
        doc.setFontSize(11)
      }

      doc.setFont('times', 'normal')
      doc.text('di -', 15, curY + (formData.penerimaJabatan ? 17 : 12))
      doc.text(item.location || 'Tempat', 20, curY + (formData.penerimaJabatan ? 22 : 18))
      curY += 35
    }

    // --- 3. GREETING ---
    doc.setFont('times', 'normal')
    doc.text('Assalamu’alaikum Warahmatullahi Wabarakatuh,', 15, curY)
    curY += 10

    // --- 4. CONTENT RENDERING ---
    const renderContent = (text: string, fontSize = 11, fontStyle = 'normal') => {
      if (!text) return
      doc.setFont('times', fontStyle)
      doc.setFontSize(fontSize)
      const split = doc.splitTextToSize(text, 170)
      doc.text(split, 15, curY, { align: 'justify', lineHeightFactor: 1.5 })
      curY += (split.length * 7) + 5
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
          const splitPoint = doc.splitTextToSize(`${idx + 1}. ${point}`, 165)
          doc.text(splitPoint, 20, curY)
          curY += (splitPoint.length * 7)
        })
        curY += 5
      }

      // Fallback if no specific fields
      if (!formData.isiSuratPengantar && !formData.latarBelakang) {
        renderContent(item.content || item.title)
      }
    }

    // Closing
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    if (curY > 240) { doc.addPage(); curY = 30; }
    
    doc.text('Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.', 15, curY)
    doc.text('Wassalamu’alaikum Warahmatullahi Wabarakatuh,', 15, curY + 7)
    
    // --- 5. SIGNATURE BLOCK ---
    const signatureY = Math.min(260, Math.max(curY + 30, doc.internal.pageSize.height - 50))
    if (signatureY > 270) { doc.addPage(); curY = 30; }

    doc.setFont('times', 'bold')
    doc.text('Ketua DKM,', 50, signatureY, { align: 'center' })
    doc.text('Sekretaris,', 150, signatureY, { align: 'center' })
    
    doc.setDrawColor(200)
    doc.line(25, signatureY + 22, 75, signatureY + 22)
    doc.line(125, signatureY + 22, 175, signatureY + 22)
    
    doc.text('H. AGUNG GUNAWAN', 50, signatureY + 28, { align: 'center' })
    doc.text('..........................', 150, signatureY + 28, { align: 'center' })

    doc.save(`${item.type}_${item.title.replace(/[^a-z0-9]/gi, '_')}.pdf`)
    toast.success('PDF Premium berhasil diunduh')
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
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-[#0b3d2e]">Daftar Proposal</h2>
                <p className="text-xs text-neutral-400 font-medium">Manajemen dan riwayat pengajuan proposal DKM.</p>
             </div>
          </div>

          <Link href="/admin/persuratan/proposal/buat" className="w-full sm:w-auto">
            <Button className="rounded-2xl h-14 md:h-16 px-8 md:px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-[#0b3d2e] hover:bg-[#062c21] w-full">
              <Plus className="h-5 w-5 mr-3" />
              Buat Proposal
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
              <div className="text-center py-24 md:py-40 px-6 animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 md:h-28 md:w-28 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-100">
                  <FileText className="h-10 w-10 md:h-14 md:w-14 text-slate-200" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-400 mb-2 italic">Belum ada dokumen {activeTab.toLowerCase()}</h3>
                <p className="text-slate-300 text-sm font-medium">Draft atau riwayat proposal akan muncul di sini setelah Anda membuatnya.</p>
              </div>
            ) : (
              <div className="p-8 md:p-12 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                  {filteredData.map((item) => (
                    <Card key={item.id} className="group relative overflow-hidden rounded-[3rem] border-none shadow-2xl shadow-slate-200/40 hover:shadow-indigo-100 transition-all duration-700 bg-white border border-white hover:-translate-y-2">
                      
                      {/* Decorative Background Element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-indigo-50/50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-150 duration-700" />
                      
                      <CardContent className="p-8 md:p-10 space-y-8 relative z-10">
                        {/* Status & Type Header */}
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border-none ${
                                item.type === 'PROPOSAL' ? 'bg-indigo-600/10 text-indigo-700' : 
                                item.type === 'UNDANGAN' ? 'bg-emerald-600/10 text-emerald-700' : 'bg-amber-600/10 text-amber-700'
                              }`}>
                                {item.type}
                              </Badge>
                              {item.nomorSurat && (
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter pl-1">
                                  No: {item.nomorSurat}
                                </p>
                              )}
                           </div>
                           <StatusBadge status={item.status} />
                        </div>

                        {/* Title & Subject */}
                        <div className="space-y-3">
                           <h4 className="font-black text-[#0b3d2e] text-xl md:text-2xl leading-[1.2] group-hover:text-indigo-800 transition-colors duration-500 line-clamp-2">
                             {item.title}
                           </h4>
                           <div className="flex items-center gap-2">
                              <div className="h-1.5 w-12 bg-indigo-500 rounded-full group-hover:w-24 transition-all duration-700" />
                              <div className="h-1.5 w-1.5 bg-indigo-200 rounded-full" />
                           </div>
                        </div>

                        {/* Essential Details Grid */}
                        <div className="grid grid-cols-1 gap-5 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50">
                               <Send className="h-5 w-5 text-indigo-400" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Penerima</span>
                                <span className="text-xs font-bold text-slate-600 line-clamp-1">{item.recipient || 'Khalayak Umum'}</span>
                             </div>
                           </div>

                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50">
                               <Calendar className="h-5 w-5 text-emerald-400" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Tanggal Terbit</span>
                                <span className="text-xs font-bold text-slate-600">
                                  {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                             </div>
                           </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center justify-between pt-4">
                           <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-full bg-linear-to-tr from-indigo-500 to-blue-400 p-0.5 shadow-lg shadow-indigo-100 shrink-0">
                                 <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                                   {item.creator?.name?.charAt(0) || 'D'}
                                 </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Editor</span>
                                <span className="text-xs font-black text-slate-700">{item.creator?.name?.split(' ')[0] || 'Admin'}</span>
                              </div>
                           </div>

                           <div className="flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
                              {/* Validation Logic */}
                              {canValidate && item.status === 'pending' && (
                                <div className="flex gap-1 pr-1 border-r border-slate-200 mr-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50 bg-white shadow-sm hover:scale-110 transition-transform"
                                    onClick={() => handleValidate(item.id, 'validate')}
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-9 w-9 rounded-xl text-rose-600 hover:bg-rose-50 bg-white shadow-sm hover:scale-110 transition-transform"
                                    onClick={() => handleValidate(item.id, 'reject')}
                                  >
                                    <XCircle className="h-5 w-5" />
                                  </Button>
                                </div>
                              )}

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                                onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}&mode=view` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}&mode=view`)}
                                title="Lihat"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon"
                                disabled={item.status !== 'validated'}
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                                onClick={() => generatePDF(item)}
                                title="Download"
                              >
                                <Download className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                                onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}`)}
                                title="Edit"
                              >
                                <Edit2 className="h-5 w-5" />
                              </Button>

                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 rounded-xl text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                onClick={() => handleDelete(item.id)}
                                title="Hapus"
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
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'validated') return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none shrink-0">
       Tersertifikasi
    </Badge>
  )
  if (status === 'rejected') return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-rose-50 text-rose-600 border-none shrink-0">
       Ditolak
    </Badge>
  )
  return (
    <Badge className="rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border-none shrink-0">
       Menunggu Validasi
    </Badge>
  )
}
