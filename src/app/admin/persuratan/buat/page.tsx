'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ArrowLeft, Save, FileText, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function BuatPersuratanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'PROPOSAL'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    type: type,
    date: new Date().toISOString().slice(0, 10),
    content: '',
    recipient: '',
    location: '',
    nomorSurat: ''
  })

  const useTemplate = () => {
    let content = ''
    if (type === 'PROPOSAL') {
      content = `A. PENDAHULUAN\nMasjid Al-Muhajirin merupakan pusat kegiatan keagamaan dan sosial bagi warga Ragas Grenyang. Dalam rangka meningkatkan kualitas...\n\nB. MAKSUD DAN TUJUAN\nAdapun maksud dan tujuan dari kegiatan ini adalah:\n1. Mempererat tali silaturahmi...\n2. Meningkatkan syiar Islam...\n\nC. RINCIAN KEGIATAN\nHari/Tanggal: ...\nWaktu: ...\nTempat: ...\n\nD. ESTIMASI BIAYA\n(Rincian estimasi biaya dilampirkan)\n\nE. PENUTUP\nDemikian proposal ini kami susun...`
    } else if (type === 'UNDANGAN') {
      content = `Mengharap dengan hormat kehadiran Bapak/Ibu/Saudara/i dalam acara yang akan kami selenggarakan pada:\n\nHari/Tanggal: ...\nWaktu: ...\nTempat: ...\nAcara: ...\n\nDemikian undangan ini kami sampaikan, mengingat pentingnya acara tersebut kami sangat mengharapkan kehadiran tepat pada waktunya.`
    } else {
      content = `Dalam rangka pelaksanaan program kerja DKM Al-Muhajirin bidang ..., maka dengan ini kami bermaksud untuk ...\n\nHal-hal terkait teknis pelaksanaan direncanakan pada:\nHari/Tanggal: ...\nWaktu: ...\n\nDemikian permohonan/pemberitahuan ini kami sampaikan.`
    }
    setFormData({ ...formData, content })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/admin/persuratan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success('Dokumen berhasil diterbitkan!')
        router.push('/admin/persuratan')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal menyimpan dokumen')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeLabel = () => {
    if (type === 'PROPOSAL') return 'Proposal Kegiatan'
    if (type === 'UNDANGAN') return 'Surat Undangan'
    return 'Surat Resmi'
  }

  return (
    <AdminLayout title={`Buat ${getTypeLabel()}`} subtitle="Lengkapi formulir dan lihat preview dokumen secara real-time.">
      <div className="min-h-screen bg-gray-50/50">
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
          {/* LEFT: Form Input */}
          <div className={`w-full lg:w-1/2 p-6 lg:p-10 overflow-y-auto ${showPreview ? 'hidden lg:block' : 'block'}`}>
            <div className="max-w-2xl mx-auto space-y-6">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 text-neutral-600 hover:text-[#0b3d2e]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-neutral-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-[#0b3d2e] text-white flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#0b3d2e]">{getTypeLabel()}</h2>
                    <p className="text-xs text-neutral-400 font-medium">Isi formulir dengan lengkap dan benar</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Judul / Perihal*
                    </Label>
                    <Input
                      required
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold"
                      placeholder="Masukkan perihal dokumen..."
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Nomor Surat (Opsional)
                      </Label>
                      <Input
                        className="h-14 rounded-2xl bg-gray-50/50 border-gray-100"
                        placeholder="Mis: 023/DKM-AM/III/2024"
                        value={formData.nomorSurat}
                        onChange={e => setFormData({ ...formData, nomorSurat: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Tanggal Dokumen*
                      </Label>
                      <Input
                        required
                        type="date"
                        className="h-14 rounded-2xl bg-gray-50/50 border-gray-100"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>

                  {type !== 'PROPOSAL' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Penerima / Kepada Yth*
                        </Label>
                        <Input
                          required
                          className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-medium"
                          placeholder="Mis: Seluruh Jamaah Masjid / Organisasi XYZ"
                          value={formData.recipient}
                          onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                        />
                      </div>

                      {type === 'UNDANGAN' && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Lokasi Acara*
                          </Label>
                          <Input
                            required
                            className="h-14 rounded-2xl bg-gray-50/50 border-gray-100"
                            placeholder="Mis: Ruang Utama Masjid Al-Muhajirin"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Isi / Keterangan Dokumen*
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={useTemplate}
                        className="text-[10px] h-7 font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Gunakan Template
                      </Button>
                    </div>
                    <textarea
                      required
                      className="w-full min-h-[250px] p-6 rounded-3xl bg-gray-50/50 border border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all leading-relaxed"
                      placeholder="Tuliskan isi surat atau deskripsi proposal di sini..."
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 h-14 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
                      onClick={() => router.back()}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] h-14 rounded-2xl font-black bg-[#0b3d2e] hover:bg-[#062c21] shadow-xl text-white uppercase tracking-widest"
                    >
                      {isSubmitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                      {isSubmitting ? 'Menyimpan...' : 'Terbitkan Dokumen'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: Digital Preview */}
          <div className={`w-full lg:w-1/2 bg-gradient-to-br from-slate-100 to-slate-200 p-6 lg:p-10 overflow-y-auto lg:sticky lg:top-0 lg:h-screen ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-10 lg:p-16 min-h-[800px] border border-slate-200">
                {/* Kop Surat */}
                <div className="border-b-4 border-[#0b3d2e] pb-6 mb-8">
                  <div className="h-2 w-32 bg-[#0b3d2e] rounded-full mx-auto mb-4"></div>
                  <h1 className="text-center font-bold text-[#0b3d2e] text-lg mb-1">
                    DEWAN KEMAKMURAN MASJID (DKM)
                  </h1>
                  <h2 className="text-center font-bold text-[#0b3d2e] text-2xl mb-2">
                    AL-MUHAJIRIN RAGAS GRENYANG
                  </h2>
                  <p className="text-center text-xs text-gray-600 italic">
                    Kp. Ragas Grenyang, Desa Argawana, Kec. Puloampel, Serang - Banten 42455
                  </p>
                  <p className="text-center text-xs text-gray-600 italic">
                    Email: dkm_almuhajirin@gmail.com | Website: dkm-almuhajirin-ragas.vercel.app
                  </p>
                </div>

                {/* Content Preview */}
                <div className="space-y-6 text-sm leading-relaxed">
                  {type === 'PROPOSAL' ? (
                    <>
                      <h3 className="text-center font-bold text-xl text-[#0b3d2e] uppercase mb-2">
                        PROPOSAL KEGIATAN
                      </h3>
                      <h4 className="text-center font-bold text-lg text-[#0b3d2e] uppercase mb-6">
                        {formData.title || '[Judul Proposal]'}
                      </h4>
                      <p className="text-right text-sm mb-6">
                        Bojonegara, {formData.date ? new Date(formData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1 text-sm">
                          <p>Nomor: {formData.nomorSurat || '-'}</p>
                          <p>Lampiran: -</p>
                          <p className="font-bold">Perihal: {formData.title || '[Perihal Surat]'}</p>
                        </div>
                        <p className="text-sm">
                          Bojonegara, {formData.date ? new Date(formData.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}
                        </p>
                      </div>

                      {formData.recipient && (
                        <div className="mb-6">
                          <p>Kepada Yth.</p>
                          <p className="font-bold">{formData.recipient}</p>
                          <p>di -</p>
                          <p className="ml-4">{formData.location || 'Tempat'}</p>
                        </div>
                      )}

                      <p className="mb-4">Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    </>
                  )}

                  <div className="whitespace-pre-wrap text-justify">
                    {formData.content || '[Isi dokumen akan muncul di sini...]'}
                  </div>

                  {type !== 'PROPOSAL' && (
                    <>
                      <p className="mt-6">
                        Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.
                      </p>
                      <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    </>
                  )}

                  {/* Signature */}
                  <div className="mt-16 pt-8">
                    <p className="text-center font-bold mb-8">Pengurus DKM Al-Muhajirin</p>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <p className="font-bold mb-16">Ketua DKM,</p>
                        <div className="border-t border-black pt-2">
                          <p>( ........................ )</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-16">Sekretaris,</p>
                        <div className="border-t border-black pt-2">
                          <p>( ........................ )</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <p className="text-center text-xs text-gray-400">
                    Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi DKM Al-Muhajirin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
