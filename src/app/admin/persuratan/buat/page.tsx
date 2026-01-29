'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ArrowLeft, FileText, Users, DollarSign, CheckSquare, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BuatProposalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'PROPOSAL'
  const [activeTab, setActiveTab] = useState('umum')
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    // Umum
    namaKopSurat: 'DEWAN KEMAKMURAN MASJID (DKM) AL-MUHAJIRIN RAGAS GRENYANG',
    alamatKopSurat: 'Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten 42455',
    kontakKopSurat: 'Jl. Puloampel KM 19 Ds. Argawana Kode Pos 42455 / no.Hp 0819 1114 1616 - 0',
    nomorSurat: '001/PSPRG-RG/I/2026',
    lampiran: '',
    tempatSurat: 'Serang',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    perihalProposal: '',
    
    // Struktur
    tujuanPenerima: '',
    
    // RAB
    rabItems: [],
    
    // Penutup
    ketuaNama: '',
    sekretarisNama: ''
  })

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/persuratan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          title: formData.perihalProposal,
          nomorSurat: formData.nomorSurat,
          date: formData.tanggalSurat,
          content: JSON.stringify(formData),
          recipient: formData.tujuanPenerima,
          location: formData.tempatSurat
        })
      })

      if (res.ok) {
        toast.success('Proposal berhasil dibuat!')
        router.push('/admin/persuratan')
      } else {
        toast.error('Gagal membuat proposal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const getTypeLabel = () => {
    if (type === 'PROPOSAL') return 'Proposal Digital'
    if (type === 'UNDANGAN') return 'Surat Undangan'
    return 'Surat Resmi'
  }

  return (
    <AdminLayout title={`Pembuat ${getTypeLabel()}`} subtitle="Format otomatis sesuai standar Padepokan">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
          {/* LEFT: Form with Tabs */}
          <div className={`w-full lg:w-1/2 p-6 lg:p-10 overflow-y-auto ${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 text-neutral-600 hover:text-[#0b3d2e]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <h1 className="text-3xl font-black text-[#0b3d2e]">Pembuat {getTypeLabel()}</h1>
                  <p className="text-sm text-neutral-500">Format otomatis sesuai standar Padepokan</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">Ready For Export</Badge>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">MENUNGGU REVIEW</Badge>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white border rounded-2xl p-1 h-14">
                  <TabsTrigger value="umum" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Umum</span>
                  </TabsTrigger>
                  <TabsTrigger value="struktur" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Struktur</span>
                  </TabsTrigger>
                  <TabsTrigger value="rab" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">RAB</span>
                  </TabsTrigger>
                  <TabsTrigger value="penutup" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Penutup</span>
                  </TabsTrigger>
                </TabsList>

                {/* TAB: Umum */}
                <TabsContent value="umum" className="mt-6 space-y-6">
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Nama Kop Surat</Label>
                        <Input
                          className="h-12 rounded-xl bg-gray-50 border-gray-200"
                          value={formData.namaKopSurat}
                          onChange={e => setFormData({ ...formData, namaKopSurat: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Alamat Kop Surat (Header)</Label>
                        <Textarea
                          className="min-h-[80px] rounded-xl bg-gray-50 border-gray-200"
                          value={formData.alamatKopSurat}
                          onChange={e => setFormData({ ...formData, alamatKopSurat: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Kontak Kop Surat (Footer)</Label>
                        <Input
                          className="h-12 rounded-xl bg-gray-50 border-gray-200"
                          value={formData.kontakKopSurat}
                          onChange={e => setFormData({ ...formData, kontakKopSurat: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Nomor Surat (Otomatis/Manual)</Label>
                          <Input
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            value={formData.nomorSurat}
                            onChange={e => setFormData({ ...formData, nomorSurat: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Lampiran</Label>
                          <Input
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            placeholder="-"
                            value={formData.lampiran}
                            onChange={e => setFormData({ ...formData, lampiran: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Tempat Surat</Label>
                          <Input
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            value={formData.tempatSurat}
                            onChange={e => setFormData({ ...formData, tempatSurat: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Tanggal Surat</Label>
                          <Input
                            type="date"
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            value={formData.tanggalSurat}
                            onChange={e => setFormData({ ...formData, tanggalSurat: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Perihal Proposal</Label>
                        <Input
                          className="h-12 rounded-xl bg-gray-50 border-gray-200"
                          placeholder="Masukkan perihal proposal..."
                          value={formData.perihalProposal}
                          onChange={e => setFormData({ ...formData, perihalProposal: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: Struktur */}
                <TabsContent value="struktur" className="mt-6 space-y-6">
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardContent className="p-8 space-y-6">
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                        <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Tujuan / Penerima Proposal
                        </h3>
                        <p className="text-sm text-purple-700 mb-4">Tambahkan data penerima proposal</p>
                        <Textarea
                          className="min-h-[120px] rounded-xl bg-white border-purple-200"
                          placeholder="Contoh: Kepada Yth. Bapak/Ibu..."
                          value={formData.tujuanPenerima}
                          onChange={e => setFormData({ ...formData, tujuanPenerima: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Import Data Penerima</Label>
                        <p className="text-xs text-gray-500">Tambahkan file Excel atau CSV untuk import data penerima</p>
                        <Input type="file" className="h-12 rounded-xl bg-gray-50 border-gray-200" accept=".xlsx,.csv" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: RAB */}
                <TabsContent value="rab" className="mt-6 space-y-6">
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardContent className="p-8">
                      <div className="text-center py-12">
                        <DollarSign className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-400 mb-2">Rencana Anggaran Biaya</h3>
                        <p className="text-sm text-gray-400 mb-6">Tambahkan item RAB untuk proposal Anda</p>
                        <Button className="bg-purple-500 hover:bg-purple-600 rounded-xl">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Tambah Item RAB
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB: Penutup */}
                <TabsContent value="penutup" className="mt-6 space-y-6">
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Ketua Padepokan</Label>
                          <Input
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            placeholder="Nama Ketua"
                            value={formData.ketuaNama}
                            onChange={e => setFormData({ ...formData, ketuaNama: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-gray-700">Sekretaris</Label>
                          <Input
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                            placeholder="Nama Sekretaris"
                            value={formData.sekretarisNama}
                            onChange={e => setFormData({ ...formData, sekretarisNama: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-bold border-2"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
                <Button
                  className="flex-[2] h-14 rounded-2xl font-bold bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleSubmit}
                >
                  Ajukan Proposal
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Digital Preview */}
          <div className={`w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 lg:p-10 overflow-y-auto lg:sticky lg:top-0 lg:h-screen ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-800">Digital Preview</h2>
                <Button className="bg-blue-500 hover:bg-blue-600 rounded-xl" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Unduh PDF
                </Button>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl p-10 lg:p-16 min-h-[800px] border border-slate-200">
                {/* Logo Placeholder */}
                <div className="flex justify-between items-start mb-6">
                  <div className="h-20 w-20 rounded-full bg-purple-100 border-4 border-purple-500 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-purple-500" />
                  </div>
                  <span className="text-xs text-gray-400">Logo</span>
                </div>

                {/* Kop Surat */}
                <div className="text-center border-b-4 border-purple-500 pb-4 mb-6">
                  <h1 className="font-bold text-purple-900 text-sm mb-1">
                    {formData.namaKopSurat || 'PADEPOKAN SATRIA PINAYUNGAN RAGAS GRENYANG'}
                  </h1>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    {formData.alamatKopSurat || 'KAMPUNG RAGAS GRENYANG DESA ARGAWANA\nKECAMATAN PULOAMPEL KABUPATEN\nSERANG-BANTEN'}
                  </p>
                  <p className="text-[8px] text-gray-500 mt-2 italic">
                    {formData.kontakKopSurat || 'Jl. Puloampel KM 19 Ds. Argawana Kode Pos 42455 / no.Hp 0819 1114 1616 - 0'}
                  </p>
                </div>

                {/* Document Info */}
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex">
                    <span className="w-24 font-semibold">Nomor</span>
                    <span className="mr-2">:</span>
                    <span>{formData.nomorSurat || '001/PSPRG-RG/I/2026'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold">Lampiran</span>
                    <span className="mr-2">:</span>
                    <span>{formData.lampiran || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 font-semibold">Perihal</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold">{formData.perihalProposal || '[Perihal Proposal]'}</span>
                  </div>
                </div>

                <div className="text-right text-sm mb-6">
                  <p>{formData.tempatSurat || 'Serang'}, {formData.tanggalSurat ? new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '29 Januari 2026'}</p>
                </div>

                {/* Recipient */}
                <div className="mb-6 text-sm">
                  <p className="font-semibold">Kepada Yth.</p>
                  <p className="whitespace-pre-wrap">{formData.tujuanPenerima || '[Tujuan Penerima]'}</p>
                  <p className="mt-2">di -</p>
                  <p className="ml-4">Tempat</p>
                </div>

                {/* Content Preview */}
                <div className="text-sm leading-relaxed text-gray-700 mb-12">
                  <p className="mb-4">Menghaturkan,</p>
                  <p className="mb-4">Ketua DPD Padepokan</p>
                  <p className="mb-4">Kabupaten Serang</p>
                  <p className="text-xs text-gray-400 italic">[Konten proposal akan muncul di sini...]</p>
                </div>

                {/* Signature */}
                <div className="mt-16 pt-8">
                  <p className="text-center font-bold mb-8">Hormat Kami,</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <p className="font-bold mb-16">Ketua Padepokan,</p>
                      <div className="border-t border-black pt-2">
                        <p>{formData.ketuaNama || '( ........................ )'}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold mb-16">Sekretaris,</p>
                      <div className="border-t border-black pt-2">
                        <p>{formData.sekretarisNama || '( ........................ )'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
