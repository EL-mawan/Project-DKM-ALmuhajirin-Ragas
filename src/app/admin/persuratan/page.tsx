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
  Clock
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

export default function PersuratanAdmin() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('PROPOSAL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { statusProps, showSuccess, showError} = useStatusPopup()
  
  // Check if user can validate documents
  const canValidate = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Tokoh Masyarakat'].includes(session.user.role)

  const [formData, setFormData] = useState<any>({
    title: '',
    type: 'PROPOSAL',
    date: new Date().toISOString().slice(0, 16),
    content: '',
    recipient: '',
    location: '',
    nomorSurat: ''
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const url = editingItem ? `/api/admin/persuratan/${editingItem.id}` : '/api/admin/persuratan'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeTab })
      })

      if (res.ok) {
        showSuccess(
          editingItem ? 'Dokumen Diperbarui' : 'Dokumen Berhasil Dibuat',
          `Dokumen ${activeTab.toLowerCase()} telah tersimpan di sistem.`
        )
        setIsModalOpen(false)
        resetForm()
        fetchData()
      } else {
        const err = await res.json()
        showError('Gagal Menyimpan', err.error || 'Terjadi kesalahan server.')
      }
    } catch (error) {
      showError('Error', 'Sistem tidak dapat memproses permintaan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      type: activeTab,
      date: new Date().toISOString().slice(0, 16),
      content: '',
      recipient: '',
      location: '',
      nomorSurat: ''
    })
  }

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
    const dkmSlate = [15, 23, 42] // #0f172a
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2

    // --- 1. KOPSURAT (PREMIUM STYLE) ---
    doc.setFillColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
    doc.roundedRect(centerX - 40, 10, 80, 2, 1, 1, 'F')
    
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.setTextColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
    doc.text('DEWAN KEMAKMURAN MASJID (DKM)', centerX, 20, { align: 'center' })
    doc.setFontSize(18)
    doc.text('AL-MUHAJIRIN RAGAS GRENYANG', centerX, 28, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('times', 'italic')
    doc.setTextColor(100, 116, 139)
    doc.text('Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten 42455', centerX, 33, { align: 'center' })
    doc.text('Email: dkm_almuhajirin@gmail.com | Website: dkm-almuhajirin-ragas.vercel.app', centerX, 37, { align: 'center' })
    
    doc.setDrawColor(dkmEmerald[0], dkmEmerald[1], dkmEmerald[2])
    doc.setLineWidth(1)
    doc.line(15, 41, 195, 41)
    doc.setLineWidth(0.2)
    doc.line(15, 42.5, 195, 42.5)

    let curY = 55
    doc.setFont('times', 'normal')
    doc.setTextColor(dkmSlate[0], dkmSlate[1], dkmSlate[2])
    doc.setFontSize(11)

    if (item.type === 'PROPOSAL') {
      // --- PROPOSAL LAYOUT ---
      doc.setFontSize(18)
      doc.setFont('times', 'bold')
      doc.text('PROPOSAL KEGIATAN', centerX, curY + 10, { align: 'center' })
      doc.setFontSize(14)
      doc.text(item.title.toUpperCase(), centerX, curY + 20, { align: 'center' })
      
      doc.setFontSize(11)
      doc.setFont('times', 'normal')
      doc.text(`Bojonegara, ${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 195, curY + 35, { align: 'right' })
      
      curY += 50
    } else {
      // --- LETTER LAYOUT ---
      const dateStr = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.text(`Bojonegara, ${dateStr}`, 195, curY, { align: 'right' })
      
      doc.text(`Nomor      : ${item.nomorSurat || '-'}`, 15, curY)
      doc.text(`Lampiran  : -`, 15, curY + 6)
      doc.setFont('times', 'bold')
      doc.text(`Perihal      : ${item.title.toUpperCase()}`, 15, curY + 12)
      
      curY += 25

      if (item.recipient) {
        doc.setFont('times', 'normal')
        doc.text('Kepada Yth.', 15, curY)
        doc.setFont('times', 'bold')
        doc.text(item.recipient, 15, curY + 6)
        doc.setFont('times', 'normal')
        doc.text('di -', 15, curY + 12)
        doc.text(item.location || 'Tempat', 20, curY + 18)
        curY += 30
      }
    }

    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    
    if (item.type !== 'PROPOSAL') {
      doc.text('Assalamu’alaikum Warahmatullahi Wabarakatuh,', 15, curY)
      curY += 10
    }

    const splitText = doc.splitTextToSize(item.content || '', 170)
    doc.text(splitText, 15, curY, { align: 'justify', lineHeightFactor: 1.5 })
    
    curY += (splitText.length * 7) + 10
    
    if (item.type !== 'PROPOSAL') {
      doc.text('Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.', 15, curY)
      doc.text('Wassalamu’alaikum Warahmatullahi Wabarakatuh,', 15, curY + 7)
    }

    const bottom = doc.internal.pageSize.height
    const signatureY = Math.max(curY + 30, bottom - 60)
    
    doc.setFont('times', 'bold')
    doc.text('Pengurus DKM Al-Muhajirin', centerX, signatureY - 10, { align: 'center' })
    
    doc.text('Ketua DKM,', 45, signatureY, { align: 'center' })
    doc.text('Sekretaris,', 165, signatureY, { align: 'center' })
    
    doc.line(20, signatureY + 25, 70, signatureY + 25)
    doc.line(140, signatureY + 25, 190, signatureY + 25)
    
    doc.setFont('times', 'normal')
    doc.text('( ........................ )', 45, signatureY + 31, { align: 'center' })
    doc.text('( ........................ )', 165, signatureY + 31, { align: 'center' })

    doc.setFontSize(8)
    doc.setTextColor(203, 213, 225)
    doc.text('Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi DKM Al-Muhajirin', centerX, bottom - 10, { align: 'center' })

    doc.save(`${item.type}_${item.title.replace(/\s+/g, '_')}.pdf`)
  }

  const useTemplate = () => {
    let content = ''
    if (activeTab === 'PROPOSAL') {
      content = `A. PENDAHULUAN\\nMasjid Al-Muhajirin merupakan pusat kegiatan keagamaan dan sosial bagi warga Ragas Grenyang. Dalam rangka meningkatkan kualitas...\\n\\nB. MAKSUD DAN TUJUAN\\nAdapun maksud dan tujuan dari kegiatan ini adalah:\\n1. Mempererat tali silaturahmi...\\n2. Meningkatkan syiar Islam...\\n\\nC. RINCIAN KEGIATAN\\nHari/Tanggal: ...\\nWaktu: ...\\nTempat: ...\\n\\nD. ESTIMASI BIAYA\\n(Rincian estimasi biaya dilampirkan)\\n\\nE. PENUTUP\\nDemikian proposal ini kami susun...`
    } else if (activeTab === 'UNDANGAN') {
      content = `Mengharap dengan hormat kehadiran Bapak/Ibu/Saudara/i dalam acara yang akan kami selenggarakan pada:\\n\\nHari/Tanggal: ...\\nWaktu: ...\\nTempat: ...\\nAcara: ...\\n\\nDemikian undangan ini kami sampaikan, mengingat pentingnya acara tersebut kami sangat mengharapkan kehadiran tepat pada waktunya.`
    } else {
      content = `Dalam rangka pelaksanaan program kerja DKM Al-Muhajirin bidang ..., maka dengan ini kami bermaksud untuk ...\\n\\nHal-hal terkait teknis pelaksanaan direncanakan pada:\\nHari/Tanggal: ...\\nWaktu: ...\\n\\nDemikian permohonan/pemberitahuan ini kami sampaikan.`
    }
    setFormData({ ...formData, content: content.replace(/\\\\n/g, '\\n') })
  }


  return (
    <AdminLayout title="Administrasi & Persuratan" subtitle="Pembuatan Proposal, Undangan, dan Surat Resmi DKM.">
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header Stats / Quick Actions */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-blue-50 to-indigo-50/30">
            <CardContent className="p-3 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                <div className="text-center md:text-left">
                  <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Proposal</p>
                  <h3 className="text-xl md:text-3xl font-black text-[#0b3d2e] mt-0.5 md:mt-1">{data.filter(d => d.type === 'PROPOSAL').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <FileText className="h-4 w-4 md:h-6 md:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-emerald-50 to-teal-50/30">
            <CardContent className="p-3 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                <div className="text-center md:text-left">
                  <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">Surat Undangan</p>
                  <h3 className="text-xl md:text-3xl font-black text-[#0b3d2e] mt-0.5 md:mt-1">{data.filter(d => d.type === 'UNDANGAN').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                  <Mail className="h-4 w-4 md:h-6 md:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm bg-linear-to-br from-amber-50 to-orange-50/30">
            <CardContent className="p-3 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
                <div className="text-center md:text-left">
                  <p className="text-[8px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest">Surat Resmi</p>
                  <h3 className="text-xl md:text-3xl font-black text-[#0b3d2e] mt-0.5 md:mt-1">{data.filter(d => d.type === 'SURAT_RESMI').length}</h3>
                </div>
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                  <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-white border rounded-2xl md:rounded-3xl p-1 h-12 md:h-16 shadow-sm w-full md:w-auto grid grid-cols-3 md:flex">
              <TabsTrigger value="PROPOSAL" className="rounded-xl px-3 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white">Proposal</TabsTrigger>
              <TabsTrigger value="UNDANGAN" className="rounded-xl px-3 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white">Undangan</TabsTrigger>
              <TabsTrigger value="SURAT_RESMI" className="rounded-xl px-3 md:px-8 font-bold text-[10px] md:text-sm data-[state=active]:bg-[#0b3d2e] data-[state=active]:text-white">Surat Resmi</TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href={activeTab === 'PROPOSAL' ? '/admin/persuratan/proposal/buat' : `/admin/persuratan/buat?type=${activeTab}`}>
            <Button className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-[#0b3d2e] hover:bg-[#062c21] w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-3" />
              Buat {activeTab === 'PROPOSAL' ? 'Proposal' : activeTab === 'UNDANGAN' ? 'Undangan' : 'Surat Resmi'}
            </Button>
          </Link>
        </div>

        {/* List of Documents */}
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
          <CardHeader className="p-10 border-b border-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#0b3d2e] text-white flex items-center justify-center">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-[#0b3d2e]">Riwayat Persuratan</CardTitle>
                  <p className="text-xs text-neutral-400 font-medium">Daftar {activeTab.toLowerCase()} yang telah diterbitkan.</p>
                </div>
              </div>
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <Input 
                  placeholder="Cari perihal atau nomor surat..." 
                  className="pl-14 h-14 rounded-2xl bg-neutral-50/50 border-transparent focus:bg-white focus:border-emerald-100 transition-all text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-32">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0b3d2e] border-t-transparent"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-32">
                <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-gray-200" />
                </div>
                <p className="text-lg font-bold text-gray-300">Belum ada dokumen {activeTab.toLowerCase()}</p>
                <p className="text-sm text-gray-400">Dokumen yang Anda buat akan muncul di riwayat ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rincian Dokumen</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Info Lain</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right text-gray-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-[#0b3d2e] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</span>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              {item.nomorSurat && (
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                                  No: {item.nomorSurat}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            {item.recipient && (
                              <span className="text-[11px] font-bold text-gray-600 flex items-center">
                                <Mail className="h-3 w-3 mr-2 text-rose-400" />
                                {item.recipient}
                              </span>
                            )}
                            {item.location && (
                              <span className="text-[10px] text-gray-400 mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-2" />
                                {item.location}
                              </span>
                            )}
                            {!item.recipient && !item.location && <span className="text-gray-300 text-xs italic">N/A</span>}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          {item.status === 'validated' ? (
                            <Badge className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none">
                              <CheckCircle className="h-3 w-3 mr-1 inline" />
                              Tervalidasi
                            </Badge>
                          ) : item.status === 'rejected' ? (
                            <Badge className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-red-50 text-red-600 border-none">
                              <XCircle className="h-3 w-3 mr-1 inline" />
                              Ditolak
                            </Badge>
                          ) : (
                            <Badge className="rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border-none">
                              <Clock className="h-3 w-3 mr-1 inline" />
                              Menunggu Validasi
                            </Badge>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-2xl h-10 w-10 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => {
                                if (item.type === 'PROPOSAL') {
                                  router.push(`/admin/persuratan/proposal/buat?id=${item.id}`)
                                } else {
                                  router.push(`/admin/persuratan/buat?type=${item.type}&id=${item.id}`)
                                }
                              }}
                              title="Edit Dokumen"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            {/* Download button - only enabled if validated */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`rounded-2xl h-10 w-10 ${item.status === 'validated' ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
                              onClick={() => item.status === 'validated' && generatePDF(item)}
                              disabled={item.status !== 'validated'}
                              title={item.status !== 'validated' ? 'Dokumen harus divalidasi terlebih dahulu' : 'Download PDF'}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            {/* Validation buttons - only for authorized roles and pending documents */}
                            {canValidate && item.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="rounded-2xl h-10 w-10 text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => handleValidate(item.id, 'validate')}
                                  title="Validasi Dokumen"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="rounded-2xl h-10 w-10 text-red-500 hover:bg-red-50"
                                  onClick={() => handleValidate(item.id, 'reject')}
                                  title="Tolak Dokumen"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-2xl h-10 w-10 text-rose-500 hover:bg-rose-50"
                              onClick={() => handleDelete(item.id)}
                              title="Hapus Dokumen"
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
      <StatusPopup {...statusProps} />
    </AdminLayout>
  )
}
