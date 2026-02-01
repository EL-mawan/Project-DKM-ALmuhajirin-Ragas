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
      doc.text(`${item.location || 'Bojonegara'}, ${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 195, curY + 35, { align: 'right' })
      
      curY += 50
    } else {
      // --- LETTER LAYOUT ---
      const dateStr = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      doc.text(`${item.location || 'Bojonegara'}, ${dateStr}`, 195, curY, { align: 'right' })
      
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

    const content = item.content || ''
    const splitText = doc.splitTextToSize(content, 170)
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
                    <Card key={item.id} className="group relative overflow-hidden rounded-4xl border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 bg-white border border-slate-50">
                      
                      {/* Status Accent Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        item.status === 'validated' ? 'bg-emerald-500' : 
                        item.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />

                      <CardContent className="p-6 md:p-8 space-y-6">
                        {/* Header: Title & Status */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-black text-[#0b3d2e] text-sm md:text-base uppercase leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-10">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {item.nomorSurat && (
                                <Badge variant="outline" className="text-[9px] font-bold text-blue-500 border-blue-100 bg-blue-50/50 rounded-lg px-2 py-0">
                                  {item.nomorSurat}
                                </Badge>
                              )}
                              <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-tighter">
                                <Calendar className="h-3 w-3 mr-1 text-slate-300" />
                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>

                        {/* Mid Section: Recipient & Location */}
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                          {item.recipient && (
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                                <Mail className="h-3 w-3 text-rose-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Penerima</p>
                                <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-1">{item.recipient}</p>
                              </div>
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="h-3 w-3 text-emerald-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Lokasi</p>
                                <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-1">{item.location}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer: CRUD Actions */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex gap-1.5 flex-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 rounded-xl h-10 md:h-11 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider transition-all"
                              onClick={() => router.push(item.type === 'PROPOSAL' ? `/admin/persuratan/proposal/buat?id=${item.id}` : `/admin/persuratan/buat?type=${item.type}&id=${item.id}`)}
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={item.status !== 'validated'}
                              className={`flex-1 rounded-xl h-10 md:h-11 font-bold text-[10px] uppercase tracking-wider transition-all ${
                                item.status === 'validated' 
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                : 'bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed'
                              }`}
                              onClick={() => generatePDF(item)}
                            >
                              <Download className="h-3.5 w-3.5 mr-2" /> PDF
                            </Button>
                          </div>

                          <div className="flex gap-1.5">
                             {canValidate && item.status === 'pending' && (
                               <>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="rounded-xl h-10 w-10 md:h-11 md:w-11 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                   onClick={() => handleValidate(item.id, 'validate')}
                                   title="Validasi Dokumen"
                                 >
                                   <CheckCircle className="h-4 w-4" />
                                 </Button>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="rounded-xl h-10 w-10 md:h-11 md:w-11 bg-rose-50 text-rose-500 hover:bg-rose-100" 
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
                               className="rounded-xl h-10 w-10 md:h-11 md:w-11 bg-slate-50 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                               onClick={() => handleDelete(item.id)}
                               title="Hapus Dokumen"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </div>
                      </CardContent>

                      {/* Hover Decoration */}
                      <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-emerald-50/50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-all duration-500 opacity-0 group-hover:opacity-100" />
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
    <Badge className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none shrink-0">
      <CheckCircle className="h-3 w-3 mr-1 inline" /> Tervalidasi
    </Badge>
  )
  if (status === 'rejected') return (
    <Badge className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-red-50 text-red-600 border-none shrink-0">
      <XCircle className="h-3 w-3 mr-1 inline" /> Ditolak
    </Badge>
  )
  return (
    <Badge className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest bg-amber-50 text-amber-600 border-none shrink-0">
      <Clock className="h-3 w-3 mr-1 inline" /> Pending
    </Badge>
  )
}
