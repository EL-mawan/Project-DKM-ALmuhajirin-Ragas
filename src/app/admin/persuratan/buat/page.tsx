'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdminLayout } from '@/components/layout/admin-layout'
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  DollarSign, 
  CheckSquare, 
  Download, 
  Eye, 
  Calendar, 
  MapPin, 
  Clock, 
  PenTool,
  Upload,
  Layout,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import jsPDF from 'jspdf'

export const dynamic = 'force-dynamic'

function BuatPersuratanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'PROPOSAL'
  const [activeTab, setActiveTab] = useState('umum')
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    // Kop Surat
    namaKopSurat: 'DEWAN KEMAKMURAN MASJID (DKM) AL-MUHAJIRIN RAGAS GRENYANG',
    alamatKopSurat: 'Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten 42455',
    kontakKopSurat: 'Jl. Puloampel KM 19 Ds. Argawana Kode Pos 42455 / no.Hp 0819 1114 1616',
    
    // Info Surat
    nomorSurat: '001/PSPRG-RG/I/2026',
    perihal: '',
    lampiran: '',
    tempatSurat: 'Argawana',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    
    // Penerima
    penerimaNama: '',
    penerimaJabatan: '',
    penerimaLokasi: 'Tempat',
    
    // Konten (Undangan/Surat)
    pembuka: 'Assalamu\'alaikum Wr. Wb. \n\nSalam silaturahmi kami sampaikan, teriring doa semoga bapak beserta keluarga selalu berada dalam lindungan Allah SWT, diberikan kesehatan, serta kelancaran dalam segala urusan.',
    hariAcara: '',
    tanggalAcara: '',
    waktuAcara: '',
    lokasiAcara: '',
    namaAcara: '',
    penutup: 'Demikian surat undangan ini kami sampaikan, semoga dapat dikabulkan serta dapat dipahami, dan besar harapan kami semoga bapak pimpinan dapat merealisasikan undangan tersebut atas perhatiannya kami ucapkan terimakasih.',
    
    // RAB (khusus proposal)
    rabItems: [],
    
    // Tanda Tangan
    tandaTangan1: 'Ketua Padepokan',
    tandaTangan1Nama: '',
    tandaTangan2: 'Sekretaris',
    tandaTangan2Nama: '',
    tandaTangan3: 'Guru Besar (Mengetahui)',
    tandaTangan3Nama: ''
  })

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/persuratan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          title: type === 'PROPOSAL' ? formData.perihal : formData.perihal,
          nomorSurat: formData.nomorSurat,
          date: formData.tanggalSurat,
          content: JSON.stringify(formData),
          recipient: formData.penerimaNama,
          location: formData.tempatSurat
        })
      })

      if (res.ok) {
        toast.success(`${getTypeLabel()} berhasil diajukan!`)
        router.push('/admin/persuratan')
      } else {
        toast.error('Gagal mengajukan dokumen')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const getTypeLabel = () => {
    if (type === 'PROPOSAL') return 'Proposal'
    if (type === 'UNDANGAN') return 'Surat Undangan'
    return 'Surat Resmi'
  }

  const generatePreviewPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2
    const mLeft = 20

    // --- KOP SURAT ---
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.setTextColor(0, 0, 0)
    const titleLines = doc.splitTextToSize(formData.namaKopSurat, 170)
    doc.text(titleLines, centerX, 20, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('times', 'normal')
    const addressLines = doc.splitTextToSize(formData.alamatKopSurat, 170)
    doc.text(addressLines, centerX, 30, { align: 'center' })

    const contactY = 30 + (addressLines.length * 4) + 2
    doc.setFont('times', 'italic')
    doc.text(formData.kontakKopSurat, centerX, contactY, { align: 'center' })

    const lineY = contactY + 3
    doc.setLineWidth(1)
    doc.line(mLeft, lineY, pageWidth - mLeft, lineY)

    // --- INFO ---
    let curY = lineY + 15
    doc.setFontSize(11)
    doc.setFont('times', 'normal')

    doc.text(`No      : ${formData.nomorSurat}`, mLeft, curY)
    doc.text(`Perihal : ${formData.perihal}`, mLeft, curY + 6)
    doc.text(`${formData.tempatSurat}, ${new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - mLeft, curY, { align: 'right' })

    // --- RECIPIENT ---
    curY += 20
    doc.text('Kepada Yth.', mLeft, curY)
    doc.setFont('times', 'bold')
    doc.text(formData.penerimaNama, mLeft, curY + 6)
    doc.setFont('times', 'normal')
    doc.text('di -', mLeft, curY + 12)
    doc.text(formData.penerimaLokasi, mLeft + 10, curY + 18)

    // --- CONTENT ---
    curY += 30
    const pembukaLines = doc.splitTextToSize(formData.pembuka, 170)
    doc.text(pembukaLines, mLeft, curY)
    curY += (pembukaLines.length * 5) + 5

    if (type === 'UNDANGAN' && formData.namaAcara) {
      doc.text(`Hari/Tanggal : ${formData.hariAcara}, ${formData.tanggalAcara}`, mLeft + 10, curY)
      doc.text(`Waktu        : ${formData.waktuAcara}`, mLeft + 10, curY + 6)
      doc.text(`Tempat       : ${formData.lokasiAcara}`, mLeft + 10, curY + 12)
      doc.text(`Acara        : ${formData.namaAcara}`, mLeft + 10, curY + 18)
      curY += 30
    }

    const penutupLines = doc.splitTextToSize(formData.penutup, 170)
    doc.text(penutupLines, mLeft, curY)
    curY += (penutupLines.length * 5) + 20

    // --- SIGNATURES ---
    const sigY = curY
    doc.text(formData.tandaTangan1, mLeft + 20, sigY, { align: 'center' })
    doc.text(formData.tandaTangan1Nama || '........................', mLeft + 20, sigY + 25, { align: 'center' })
    
    doc.text(formData.tandaTangan2, pageWidth - mLeft - 20, sigY, { align: 'center' })
    doc.text(formData.tandaTangan2Nama || '........................', pageWidth - mLeft - 20, sigY + 25, { align: 'center' })

    if (formData.tandaTangan3Nama) {
      doc.text('Mengetahui,', centerX, sigY + 35, { align: 'center' })
      doc.text(formData.tandaTangan3, centerX, sigY + 41, { align: 'center' })
      doc.text(formData.tandaTangan3Nama, centerX, sigY + 65, { align: 'center' })
    }

    doc.save(`Draft_${type}_${formData.perihal}.pdf`)
  }

  return (
    <AdminLayout title={`Pembuat ${getTypeLabel()} Digital`} subtitle="Format otomatis sesuai standar organisasi.">
      <div className="min-h-screen bg-slate-50/50">
        {/* Mobile Preview Toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            className="h-14 w-14 rounded-full shadow-2xl bg-[#0b3d2e] hover:bg-[#062c21]"
          >
            <Eye className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* LEFT: FORM INPUT */}
          <div className={`w-full lg:w-1/2 p-4 lg:p-8 overflow-y-auto ${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="max-w-3xl mx-auto space-y-6 pb-20">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-black text-[#0b3d2e]">Buat {getTypeLabel()} Baru</h1>
                  <p className="text-sm text-neutral-500">Lengkapi formulir di bawah ini</p>
                </div>
              </div>

              {type === 'PROPOSAL' ? (
                /* PROPOSAL TABS UI */
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white border rounded-2xl p-1 h-14 shadow-sm">
                    <TabsTrigger value="umum" className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest">Umum</TabsTrigger>
                    <TabsTrigger value="struktur" className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest">Struktur</TabsTrigger>
                    <TabsTrigger value="rab" className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest">RAB</TabsTrigger>
                    <TabsTrigger value="penutup" className="rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white uppercase text-[10px] font-black tracking-widest">Penutup</TabsTrigger>
                  </TabsList>

                  <TabsContent value="umum" className="mt-6">
                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                        <CardTitle className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                          <Layout className="h-4 w-4" /> Informasi Umum
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Kop Surat</Label>
                          <Input value={formData.namaKopSurat} onChange={e => setFormData({...formData, namaKopSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Alamat Lengkap</Label>
                          <Textarea value={formData.alamatKopSurat} onChange={e => setFormData({...formData, alamatKopSurat: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nomor Surat</Label>
                            <Input value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Perihal</Label>
                            <Input value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* ... Tambahkan tab lainnya jika perlu ... */}
                </Tabs>
              ) : (
                /* UNDANGAN/SURAT STACKED CARDS UI */
                <div className="space-y-6">
                  {/* 1. KOP SURAT */}
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 flex flex-row items-center justify-between">
                      <CardTitle className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Layout className="h-4 w-4" /> Kop Surat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Nama Organisasi</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.namaKopSurat} onChange={e => setFormData({...formData, namaKopSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Alamat Lengkap</Label>
                          <Textarea className="rounded-xl border-gray-100 bg-gray-50/50 min-h-[80px]" value={formData.alamatKopSurat} onChange={e => setFormData({...formData, alamatKopSurat: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-gray-500">Kontak</Label>
                        <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.kontakKopSurat} onChange={e => setFormData({...formData, kontakKopSurat: e.target.value})} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. INFORMASI SURAT */}
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                      <CardTitle className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Informasi Surat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Nomor Surat</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Perihal</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Tempat Pembuatan</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.tempatSurat} onChange={e => setFormData({...formData, tempatSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Tanggal Surat</Label>
                          <Input type="date" className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.tanggalSurat} onChange={e => setFormData({...formData, tanggalSurat: e.target.value})} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. PENERIMA */}
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-purple-50/50 border-b border-purple-100 flex flex-row items-center justify-between">
                      <CardTitle className="text-[10px] font-black text-purple-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Users className="h-4 w-4" /> Penerima
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[9px] uppercase font-bold rounded-lg border-purple-200 text-purple-600"><Upload className="h-3 w-3 mr-1" /> Upload Excel</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-gray-500">Kepada Yth.</Label>
                        <Input className="rounded-xl border-gray-100 bg-gray-50/50" placeholder="Contoh: Bpk. H. Fulan" value={formData.penerimaNama} onChange={e => setFormData({...formData, penerimaNama: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Jabatan / Komisi</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" placeholder="Jabatan (Opsional)" value={formData.penerimaJabatan} onChange={e => setFormData({...formData, penerimaJabatan: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Di (Tempat)</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" value={formData.penerimaLokasi} onChange={e => setFormData({...formData, penerimaLokasi: e.target.value})} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 4. KONTEN */}
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-orange-50/50 border-b border-orange-100">
                      <CardTitle className="text-[10px] font-black text-orange-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Konten Surat
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-gray-500">Pembuka</Label>
                        <Textarea className="rounded-xl border-gray-100 bg-gray-50/50 min-h-[100px]" value={formData.pembuka} onChange={e => setFormData({...formData, pembuka: e.target.value})} />
                      </div>

                      {type === 'UNDANGAN' && (
                        <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-4">
                          <h4 className="text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Detail Acara
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[9px] font-bold uppercase text-gray-400">Hari</Label>
                              <Input className="h-9 rounded-lg border-gray-100 bg-white" placeholder="Senin" value={formData.hariAcara} onChange={e => setFormData({...formData, hariAcara: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] font-bold uppercase text-gray-400">Tanggal</Label>
                              <Input className="h-9 rounded-lg border-gray-100 bg-white" placeholder="10 Januari 2026" value={formData.tanggalAcara} onChange={e => setFormData({...formData, tanggalAcara: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] font-bold uppercase text-gray-400">Waktu</Label>
                              <Input className="h-9 rounded-lg border-gray-100 bg-white" placeholder="09:00 WIB s/d Selesai" value={formData.waktuAcara} onChange={e => setFormData({...formData, waktuAcara: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[9px] font-bold uppercase text-gray-400">Tempat</Label>
                              <Input className="h-9 rounded-lg border-gray-100 bg-white" placeholder="Lokasi Acara" value={formData.lokasiAcara} onChange={e => setFormData({...formData, lokasiAcara: e.target.value})} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase text-gray-400">Nama Kegiatan / Agenda</Label>
                            <Input className="h-9 rounded-lg border-gray-100 bg-white" placeholder="Agenda Rapat" value={formData.namaAcara} onChange={e => setFormData({...formData, namaAcara: e.target.value})} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-gray-500">Penutup</Label>
                        <Textarea className="rounded-xl border-gray-100 bg-gray-50/50 min-h-[80px]" value={formData.penutup} onChange={e => setFormData({...formData, penutup: e.target.value})} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5. TANDA TANGAN */}
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-teal-50/50 border-b border-teal-100">
                      <CardTitle className="text-[10px] font-black text-teal-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> Tanda Tangan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Ketua Padepokan</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" placeholder="Nama Ketua" value={formData.tandaTangan1Nama} onChange={e => setFormData({...formData, tandaTangan1Nama: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Sekretaris</Label>
                          <Input className="rounded-xl border-gray-100 bg-gray-50/50" placeholder="Nama Sekretaris" value={formData.tandaTangan2Nama} onChange={e => setFormData({...formData, tandaTangan2Nama: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-gray-500">Guru Besar (Mengetahui)</Label>
                        <Input className="rounded-xl border-gray-100 bg-gray-50/50" placeholder="Nama Guru Besar" value={formData.tandaTangan3Nama} onChange={e => setFormData({...formData, tandaTangan3Nama: e.target.value})} />
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleSubmit} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                    Simpan & Ajukan Dokumen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DIGITAL PREVIEW */}
          <div className={`w-full lg:w-1/2 bg-slate-200/50 p-4 lg:p-8 overflow-y-auto lg:sticky lg:top-0 lg:h-screen ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Digital Preview</h2>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Ready</Badge>
                  <Button size="sm" onClick={generatePreviewPDF} className="h-9 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                </div>
              </div>

              {/* PAPER PREVIEW */}
              <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden">
                {/* LOGO & KOP */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="text-center flex-1 px-4">
                    <h1 className="font-black text-slate-900 text-sm leading-tight uppercase tracking-tight">{formData.namaKopSurat}</h1>
                    <p className="text-[9px] text-slate-600 mt-1 leading-tight">{formData.alamatKopSurat}</p>
                    <p className="text-[8px] text-slate-500 mt-1 italic">{formData.kontakKopSurat}</p>
                  </div>
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-[8px] font-bold text-slate-300">LOGO</div>
                </div>

                {/* INFO */}
                <div className="flex justify-between items-start text-[10px] mb-8">
                  <div className="space-y-1">
                    <p><span className="w-16 inline-block">No</span> : <span className="font-bold">{formData.nomorSurat}</span></p>
                    <p><span className="w-16 inline-block">Perihal</span> : <span className="font-bold underline uppercase">{formData.perihal || '...'}</span></p>
                  </div>
                  <div className="text-right">
                    <p>{formData.tempatSurat}, {new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* RECIPIENT */}
                <div className="text-[10px] mb-8">
                  <p className="font-bold">Kepada Yth.</p>
                  <p className="font-black mt-1 uppercase text-xs tracking-tight">{formData.penerimaNama || '............................'}</p>
                  {formData.penerimaJabatan && <p className="italic text-slate-500">{formData.penerimaJabatan}</p>}
                  <p className="mt-2 font-bold italic">di - {formData.penerimaLokasi || 'Tempat'}</p>
                </div>

                {/* CONTENT */}
                <div className="text-[10px] space-y-4 text-slate-900 leading-relaxed">
                  <p className="font-black">Assalamu'alaikum Wr. Wb.</p>
                  <p className="whitespace-pre-wrap">{formData.pembuka}</p>

                  {type === 'UNDANGAN' && formData.namaAcara && (
                    <div className="ml-8 space-y-1 py-4">
                      <p><span className="w-24 inline-block">Hari / Tanggal</span> : {formData.hariAcara}, {formData.tanggalAcara}</p>
                      <p><span className="w-24 inline-block">Waktu</span> : {formData.waktuAcara}</p>
                      <p><span className="w-24 inline-block">Tempat</span> : {formData.lokasiAcara}</p>
                      <p><span className="w-24 inline-block font-bold">Acara</span> : <span className="font-bold underline">{formData.namaAcara}</span></p>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{formData.penutup}</p>
                  <p className="font-black">Wassalamu'alaikum Wr. Wb.</p>
                </div>

                {/* SIGNATURES */}
                <div className="mt-16 grid grid-cols-2 gap-8 text-[10px] text-center font-bold">
                  <div className="space-y-16">
                    <p className="uppercase">{formData.tandaTangan1}</p>
                    <div>
                      <p className="underline uppercase font-black">{formData.tandaTangan1Nama || '............................'}</p>
                    </div>
                  </div>
                  <div className="space-y-16">
                    <p className="uppercase">{formData.tandaTangan2}</p>
                    <div>
                      <p className="underline uppercase font-black">{formData.tandaTangan2Nama || '............................'}</p>
                    </div>
                  </div>
                </div>

                {formData.tandaTangan3Nama && (
                  <div className="mt-8 text-center text-[10px] font-bold space-y-12">
                    <div className="space-y-0.5">
                      <p className="uppercase">Mengetahui,</p>
                      <p className="uppercase">{formData.tandaTangan3}</p>
                    </div>
                    <p className="underline uppercase font-black">{formData.tandaTangan3Nama}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function BuatPersuratanPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat Pembuat Dokumen...</p>
        </div>
      </div>
    }>
      <BuatPersuratanContent />
    </Suspense>
  )
}
