'use client'

import { useState, useRef, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdminLayout } from '@/components/layout/admin-layout'
import { 
  ArrowLeft, FileDown, 
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
  MessageSquare,
  Plus,
  ArrowRight,
  Wand2,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const dynamic = 'force-dynamic'

function BuatPersuratanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'PROPOSAL'
  const documentId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState('umum')
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [documentStatus, setDocumentStatus] = useState<string>('pending')

  const [formData, setFormData] = useState({
    // Kop Surat
    namaKopSurat: 'DEWAN KEMAKMURAN MASJID (DKM)\nAL-MUHAJIRIN KP. RAGAS GRENYANG',
    alamatKopSurat: 'Desa Argawana, Kecamatan Puloampel Kabupaten Serang\nProvinsi Banten 42455',
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
    pembuka: `Assalamu'alaikum Wr. Wb. 

Salam silaturahmi kami sampaikan, teriring doa semoga bapak beserta keluarga selalu berada dalam lindungan Allah SWT, diberikan kesehatan, serta kelancaran dalam segala urusan.`,
    hariAcara: '',
    tanggalAcara: '',
    waktuAcara: '',
    lokasiAcara: '',
    namaAcara: '',
    penutup: `Demikian surat undangan ini kami sampaikan, semoga dapat dikabulkan serta dapat dipahami, dan besar harapan kami semoga bapak pimpinan dapat merealisasikan undangan tersebut atas perhatiannya kami ucapkan terimakasih.`,
    
    // --- PROPOSAL TABS STATE ---
    isiSuratPengantar: `Bersama dengan surat ini, kami selaku Pengurus DKM Al-Muhajirin bermaksud untuk mengajukan permohonan dukungan dan kerjasama dalam rangka mensukseskan kegiatan yang telah kami rencanakan. Kami sangat berharap Bapak/Ibu dapat memberikan dukungan positif bagi terealisasinya program kebaikan ini, demi kemaslahatan umat dan peningkatan syiar Islam di lingkungan kita.`,
    latarBelakang: `Masjid Al-Muhajirin merupakan pusat kegiatan keagamaan, sosial, dan dakwah bagi jamaah serta warga di lingkungan Kampung Ragas Grenyang. Seiring dengan perkembangan zaman dan bertambahnya jumlah jamaah, tantangan dalam mengelola kegiataan dakwah serta menjaga fasilitas masjid pun semakin meningkat.`,
    maksudTujuanList: [
      'Meningkatkan kualitas sarana dan prasarana ibadah bagi jamaah Masjid Al-Muhajirin.',
      'Mempererat tali silaturahmi dan ukhuwah islamiyah antar warga Ragas Grenyang.',
      'Mewujudkan lingkungan masjid yang nyaman, tertib, dan religius.'
    ],
    waktuTempatAktif: false,
    
    // Struktur
    pelindungRW: '',
    penasehatRT: '',
    ketuaPemudaStruktur: '',
    guruBesarStruktur: '',
    ketuaPadepokanStruktur: '',
    sekretarisStruktur: '',
    bendaharaStruktur: '',
    anggotaList: [] as string[],

    // RAB
    rabItems: [] as { item: string, jumlah: string, harga: number, total: number }[],
    lampiranFotos: [] as string[],
    
    // Penutup / Signatures
    kalimatPenutup: `Demikian proposal ini kami sampaikan dengan harapan besar agar Bapak/Ibu dapat membersamai langkah mulia ini. Kami percaya bahwa setiap kontribusi dan dukungan yang diberikan merupakan bentuk investasi akhirat yang tak terputus.`,
    lokasiPenerbitan: 'Serang',
    
    // Signatures
    ttdSekretarisDKM: '',
    ttdKetuaDKM: '',
    ttdBendaharaDKM: '',
    ttdTokohMasyarakat: '',
    ttdKetuaRT: '',
    ttdKetuaRW: '',
    ttdKetuaPemuda: '',
    ttdGuruBesar: '',
    ttdKetuaPadepokan: '',
    ttdKetuaDPDBandrong: ''
  })

  // State for Organization Structure Data
  const [strukturOrganisasi, setStrukturOrganisasi] = useState<{ name: string, position: string }[]>([])

  // Fetch Structure Data
  useEffect(() => {
    const fetchStruktur = async () => {
      try {
        const res = await fetch('/api/admin/struktur')
        if (res.ok) {
          const strukturData = await res.json()
          setStrukturOrganisasi(strukturData.filter((s: any) => s.isActive).map((s: any) => ({ name: s.name, position: s.position })))
        }
      } catch (error) {
        console.error('Failed to fetch struktur:', error)
      }
    }
    fetchStruktur()
  }, [])

  // Fetch existing document if editing
  useEffect(() => {
    if (documentId) {
      const fetchDocument = async () => {
        try {
          const res = await fetch(`/api/admin/persuratan/${documentId}`)
          if (res.ok) {
            const doc = await res.json()
            if (doc.content) {
              const parsed = JSON.parse(doc.content)
              setFormData(parsed)
            }
            setDocumentStatus(doc.status || 'pending')
          }
        } catch (error) {
          console.error('Failed to fetch document:', error)
          toast.error('Gagal mengambil data dokumen')
        }
      }
      fetchDocument()
    }
  }, [documentId])

  // Helper for RAB calculations
  const totalRAB = formData.rabItems.reduce((acc, curr) => acc + curr.total, 0)

  const addAnggota = () => {
    setFormData({ ...formData, anggotaList: [...formData.anggotaList, ''] })
  }

  const updateAnggota = (index: number, val: string) => {
    const newList = [...formData.anggotaList]
    newList[index] = val
    setFormData({ ...formData, anggotaList: newList })
  }

  const addRABItem = () => {
    setFormData({ 
      ...formData, 
      rabItems: [...formData.rabItems, { item: '', jumlah: '', harga: 0, total: 0 }] 
    })
  }

  const updateRABItem = (index: number, field: string, val: any) => {
    const newItems = [...formData.rabItems]
    newItems[index] = { ...newItems[index], [field]: val }
    if (field === 'jumlah' || field === 'harga') {
      const qty = parseFloat(newItems[index].jumlah) || 0
      const price = parseFloat(val) || (field === 'harga' ? val : newItems[index].harga)
      newItems[index].total = qty * price
    }
    setFormData({ ...formData, rabItems: newItems })
  }


  const downloadExcelTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama Penerima,Jabatan / Komisi,Tempat\nFulan bin Fulan,Ketua DPD Bandrong,Serang";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_penerima.csv");
    document.body.appendChild(link);
    link.click();
    toast.info("Template CSV berhasil diunduh.")
  }

  const handleExcelUpload = () => {
    // Mock logic for parsing
    toast.success("File Excel berhasil diunggah (Data Terolah).")
    setFormData(prev => ({
      ...prev,
      penerimaNama: "H. Ahmad Sodik",
      penerimaJabatan: "Camat Puloampel",
      penerimaLokasi: "Kecamatan Puloampel"
    }))
  }

  const addMaksudTujuan = () => {
    setFormData(prev => ({ ...prev, maksudTujuanList: [...prev.maksudTujuanList, ''] }))
  }

  const updateMaksudTujuan = (idx: number, val: string) => {
    const newList = [...formData.maksudTujuanList]
    newList[idx] = val
    setFormData({ ...formData, maksudTujuanList: newList })
  }

  const removeMaksudTujuan = (idx: number) => {
    setFormData(prev => ({ ...prev, maksudTujuanList: prev.maksudTujuanList.filter((_, i) => i !== idx) }))
  }

  const applyPenerimaTemplate = () => {
    setFormData(prev => ({
      ...prev,
      penerimaNama: 'Kepala Desa Argawana',
      penerimaJabatan: 'Pemerintah Desa',
      penerimaLokasi: 'Kantor Desa Argawana'
    }))
    toast.success("Template Penerima Desa diterapkan!")
  }

  // --- AI RECOMMENDATION LOGIC ---
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null)

  const handleAiGenerate = async (type: 'isiSuratPengantar' | 'latarBelakang' | 'maksudTujuan' | 'kalimatPenutup') => {
    if (!formData.perihal || formData.perihal.trim() === '') {
      toast.error('Harap isi perihal surat terlebih dahulu sebagai konteks AI.')
      setActiveTab('umum')
      return
    }

    setIsAiLoading(type)
    
    const promise = async () => {
      const prompts: Record<string, string> = {
        isiSuratPengantar: `Buatkan isi surat pengantar yang sangat formal dan santun untuk "${formData.perihal}". Mulai dengan salam "Assalamu'alaikum Wr. Wb.". Fokus pada penyampaian maksud kerjasama. 2-3 paragraf. Hanya berikan teks isi surat saja.`,
        latarBelakang: `Buatkan latar belakang yang persuasif dan mendalam untuk proposal/kegiatan "${formData.perihal}". Jelaskan urgensi dan manfaatnya. Minimal 3 paragraf. Hanya berikan narasi saja.`,
        kalimatPenutup: `Buatkan penutup surat yang penuh harapan dan doa untuk "${formData.perihal}". Akhiri dengan "Wassalamu'alaikum Wr. Wb.". Hanya berikan teks penutup saja.`,
        maksudTujuan: `Buatkan 5 poin maksud dan tujuan strategis untuk "${formData.perihal}". Berikan HANYA dalam format JSON: {"tujuan": ["Poin 1", "Poin 2", "Poin 3"]}.`
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompts[type],
          context: { perihal: formData.perihal, type: type }
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.details || result.error || 'AI Gagal')

      let text = result.text || ''
      if (!text) throw new Error('AI tidak merespon')

      // Cleaning
      let cleanText = text.trim()
      if (cleanText.includes('```')) {
        cleanText = cleanText.replace(/```(json)?/g, '').replace(/```/g, '').trim()
      }
      
      const intros = [/^(tentu|ini|berikut)[^:\n]*:/gi, /^saya akan buatkan[^:\n]*:/gi]
      intros.forEach(re => cleanText = cleanText.replace(re, '').trim())

      if (type === 'maksudTujuan') {
        try {
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
          const cleanJson = jsonMatch ? jsonMatch[0] : cleanText
          const parsed = JSON.parse(cleanJson)
          const list = Array.isArray(parsed.tujuan) ? parsed.tujuan : (Array.isArray(parsed) ? parsed : [cleanText])
          setFormData(prev => ({ ...prev, maksudTujuanList: list }))
        } catch (e) {
          const lines = cleanText.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^-\s*/, '').trim()).filter(l => l.length > 5)
          setFormData(prev => ({ ...prev, maksudTujuanList: lines.length > 0 ? lines : [cleanText] }))
        }
      } else {
        setFormData(prev => ({ ...prev, [type]: cleanText }))
      }
      return type
    }

    toast.promise(promise(), {
      loading: 'Generate AI sedang merumuskan konten terbaik...',
      success: (resType) => {
        setIsAiLoading(null)
        return `Generate AI Berhasil! Bagian ${resType === 'isiSuratPengantar' ? 'Surat Pengantar' : resType === 'latarBelakang' ? 'Latar Belakang' : resType === 'maksudTujuan' ? 'Tujuan' : 'Penutup'} telah diperbarui.`
      },
      error: (err) => {
        setIsAiLoading(null)
        console.error(`[AI Error]:`, err)
        return `Generate Gagal: ${err.message}`
      }
    })
  }

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Deep clone to sanitize data
      const sanitizedData = JSON.parse(JSON.stringify(formData));
      
      const res = await fetch('/api/admin/persuratan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          title: sanitizedData.perihal || 'Dokumen Tanpa Judul',
          nomorSurat: sanitizedData.nomorSurat,
          date: sanitizedData.tanggalSurat,
          content: JSON.stringify(sanitizedData),
          recipient: sanitizedData.penerimaNama,
          location: sanitizedData.tempatSurat
        })
      })

      if (res.ok) {
        toast.success(`${getTypeLabel()} berhasil diajukan!`)
        router.push('/admin/persuratan')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal mengajukan dokumen')
      }
    } catch (error) {
      console.error('Submit Error:', error)
      toast.error('Terjadi kesalahan sistem saat menyimpan')
    }
  }

  const getTypeLabel = () => {
    if (type === 'PROPOSAL') return 'Proposal'
    if (type === 'UNDANGAN') return 'Surat Undangan'
    return 'Surat Resmi'
  }

  const generatePreviewPDF = async () => {
    if (!previewRef.current) return
    
    try {
      toast.info('Sedang merender PDF premium...')
      
      // Tunggu hingga font siap
      await document.fonts.ready;
      
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      })
      
      const pages = previewRef.current.querySelectorAll('.pdf-page')
      
      if (pages.length === 0) {
         toast.error('Gagal mendeteksi halaman preview')
         return
      }

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        
        // Simpan style original
        const originalStyle = page.style.cssText
        
        const canvas = await html2canvas(page, {
          scale: 3, // Skala lebih tinggi untuk ketajaman
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          windowWidth: 794,
          windowHeight: 1123,
          onclone: (clonedDoc, clonedElement) => {
             // Pastikan font seri diterapkan
             const style = clonedDoc.createElement('style');
             style.textContent = `
               @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&display=swap');
               * {
                 -webkit-font-smoothing: antialiased;
                 -moz-osx-font-smoothing: grayscale;
               }
               .pdf-page {
                 font-family: 'Times New Roman', Times, serif !important;
                 padding: 60px !important;
                 margin: 0 !important;
                 box-shadow: none !important;
                 border: none !important;
               }
               h1, h2, h3, p, div, span {
                 color: black !important;
               }
             `;
             clonedDoc.head.appendChild(style);
             
             // Hapus border dan bayangan pada elemen kloning
             if (clonedElement instanceof HTMLElement) {
               clonedElement.style.boxShadow = 'none';
               clonedElement.style.border = 'none';
               clonedElement.style.borderRadius = '0';
               clonedElement.style.transform = 'none';
             }
          }
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        if (i > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      }
      
      const fileName = `${type}_${(formData.perihal || 'Dokumen').replace(/[^a-z0-9]/gi, '_')}.pdf`
      doc.save(fileName)
      toast.success('PDF berhasil diunduh dengan kualitas premium')
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error('Gagal membuat PDF. Pastikan browser Anda mendukung.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        // Skip if it's a textarea to allow multiline or if explicitly prevented
        if (target.tagName.toLowerCase() === 'textarea') return;
        
        e.preventDefault();
        
        const form = e.currentTarget;
        const focusableElements = 'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])';
        const elements = Array.from(form.querySelectorAll(focusableElements)) as HTMLElement[];
        
        const index = elements.indexOf(target);
        if (index > -1 && index < elements.length - 1) {
            const nextElement = elements[index + 1];
            nextElement.focus();
        }
    }
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
            <div className="max-w-3xl mx-auto space-y-6 pb-20" onKeyDown={handleKeyDown}>
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

                  <TabsContent value="umum" className="mt-6 space-y-6">
                    {/* Section 1: KOP SURAT */}
                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Nama Kop Surat</Label>
                          <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" value={formData.namaKopSurat} onChange={e => setFormData({...formData, namaKopSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Alamat Kop Surat (Header)</Label>
                          <Textarea className="min-h-[100px] rounded-xl bg-slate-50 border-slate-100" value={formData.alamatKopSurat} onChange={e => setFormData({...formData, alamatKopSurat: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Kontak Kop Surat (Footer)</Label>
                          <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" value={formData.kontakKopSurat} onChange={e => setFormData({...formData, kontakKopSurat: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Nomor Surat (Otomatis/Manual)</Label>
                            <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Lampiran</Label>
                            <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" placeholder="-" value={formData.lampiran} onChange={e => setFormData({...formData, lampiran: e.target.value})} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Tempat Surat</Label>
                            <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" value={formData.tempatSurat} onChange={e => setFormData({...formData, tempatSurat: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Tanggal Surat</Label>
                            <Input type="date" className="h-12 rounded-xl bg-slate-50 border-slate-100" value={formData.tanggalSurat} onChange={e => setFormData({...formData, tanggalSurat: e.target.value})} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-slate-400">Perihal Proposal</Label>
                          <Input className="h-12 rounded-xl bg-slate-50 border-slate-100" placeholder="Contoh: Proposal Kegiatan Peringatan Hari Besar Islam..." value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 2: TUJUAN / PENERIMA */}
                    <Card className="rounded-4xl border-2 border-purple-50 shadow-sm bg-white overflow-hidden p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black text-purple-900 uppercase tracking-widest">Tujuan / Penerima Proposal</h3>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Import Data Penerima</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Automasi pengisian data penerima dari Excel/Template.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={downloadExcelTemplate} variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 text-[10px] font-black uppercase"><Layout className="h-3 w-3 mr-2" /> Template</Button>
                          <Button onClick={applyPenerimaTemplate} variant="outline" size="sm" className="h-9 rounded-xl border-purple-200 text-purple-600 text-[10px] font-black uppercase"><Users className="h-3 w-3 mr-2" /> Pakai Template DKM</Button>
                          <Button onClick={handleExcelUpload} size="sm" className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase shadow-lg shadow-emerald-100"><Upload className="h-3 w-3 mr-2" /> Upload Excel</Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Nama / Instansi Penerima</Label>
                             <Input placeholder="Yth. Bapak Kepala Desa..." className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white transition-colors" value={formData.penerimaNama} onChange={e => setFormData({...formData, penerimaNama: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Jabatan / Komisi</Label>
                             <Input placeholder="Ketua Panitia / Kepala Bagian..." className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white transition-colors" value={formData.penerimaJabatan} onChange={e => setFormData({...formData, penerimaJabatan: e.target.value})} />
                           </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Tempat / Alamat Tujuan</Label>
                          <Input placeholder="Kp. Ragas Grenyang, Argawana..." className="h-12 rounded-xl bg-slate-50/50 border-slate-100 font-bold focus:bg-white transition-colors text-xs" value={formData.penerimaLokasi} onChange={e => setFormData({...formData, penerimaLokasi: e.target.value})} />
                        </div>
                      </div>
                    </Card>

                    {/* Section 3: PENGATURAN LOGO */}
                    <Card className="rounded-4xl border-2 border-slate-50 shadow-sm bg-white overflow-hidden p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <PenTool className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pengaturan Logo Kop Surat</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="text-center space-y-4">
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Logo Kiri (Utama)</p>
                          <div className="h-20 w-20 mx-auto rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-slate-300" />
                          </div>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-[9px] uppercase font-bold"><Upload className="h-3 w-3 mr-2" /> Ganti Logo</Button>
                        </div>
                        <div className="text-center space-y-4">
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Logo Kanan (Pendamping)</p>
                          <div className="h-20 w-20 mx-auto bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-bold">LOGO</div>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-[9px] uppercase font-bold"><Upload className="h-3 w-3 mr-2" /> Ganti Logo</Button>
                        </div>
                      </div>
                    </Card>

                    {/* Section 4: ISI SURAT PENGANTAR */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-slate-600">Isi Surat Pengantar</Label>
<Button 
  onClick={() => handleAiGenerate('isiSuratPengantar')} 
  disabled={isAiLoading === 'isiSuratPengantar'}
  variant="ghost" 
  size="sm" 
  className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50 flex items-center gap-1.5"
>
  {isAiLoading === 'isiSuratPengantar' ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
  Generate AI
</Button>
                      </div>
                      <Textarea 
                        placeholder="Tulislah isi surat pengantar..." 
                        className={`min-h-[160px] rounded-3xl border-slate-200 p-6 transition-all duration-500 ${isAiLoading === 'isiSuratPengantar' ? 'animate-pulse border-purple-400 ring-2 ring-purple-50' : ''}`}
                        value={formData.isiSuratPengantar} 
                        onChange={e => setFormData({...formData, isiSuratPengantar: e.target.value})} 
                      />
                    </div>

                    {/* Section 5: NARASI LATAR BELAKANG */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-slate-600">Narasi Latar Belakang</Label>
                        <Button 
  onClick={() => handleAiGenerate('latarBelakang')} 
  disabled={isAiLoading === 'latarBelakang'}
  variant="ghost" 
  size="sm" 
  className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50 flex items-center gap-1.5"
>
  {isAiLoading === 'latarBelakang' ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
  Generate AI
</Button>
                      </div>
                      <Textarea 
                        placeholder="Tulislah alasan permohonan ini diajukan..." 
                        className={`min-h-[120px] rounded-3xl border-slate-200 p-6 transition-all duration-500 ${isAiLoading === 'latarBelakang' ? 'animate-pulse border-purple-400 ring-2 ring-purple-50' : ''}`}
                        value={formData.latarBelakang} 
                        onChange={e => setFormData({...formData, latarBelakang: e.target.value})} 
                      />
                    </div>

                    {/* Section 6: MAKSUD DAN TUJUAN */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-slate-600">Maksud dan Tujuan (Poin Ringkas)</Label>
                        <div className="flex gap-2">
  <Button 
    onClick={() => handleAiGenerate('maksudTujuan')} 
    disabled={isAiLoading === 'maksudTujuan'}
    variant="ghost" 
    size="sm" 
    className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50 flex items-center gap-1.5"
  >
    {isAiLoading === 'maksudTujuan' ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
    Generate AI
  </Button>
                          <Button onClick={addMaksudTujuan} variant="ghost" size="sm" className="h-7 text-emerald-600 font-bold text-[10px] uppercase hover:bg-emerald-50"><Plus className="h-3 w-3 mr-2" /> Tambah Manual</Button>
                        </div>
                      </div>
                      <div className={`space-y-3 transition-all duration-500 ${isAiLoading === 'maksudTujuan' ? 'animate-pulse opacity-50' : ''}`}>
                        {formData.maksudTujuanList.map((item, idx) => (
                           <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                              <Input 
                                 className="h-10 rounded-xl bg-white border-slate-100 text-xs font-bold" 
                                 placeholder={`Poin ${idx + 1}...`}
                                 value={item}
                                 onChange={(e) => updateMaksudTujuan(idx, e.target.value)}
                              />
                              <Button onClick={() => removeMaksudTujuan(idx)} variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl">
                                 <Plus className="h-4 w-4 rotate-45" />
                              </Button>
                           </div>
                        ))}
                        {formData.maksudTujuanList.length === 0 && (
                          <div className="h-20 border-2 border-dashed border-slate-100 rounded-4xl flex items-center justify-center text-slate-300 text-[10px] font-black uppercase italic tracking-widest bg-slate-50/50">
                            Belum ada poin ditambahkan
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 7: WAKTU DAN TEMPAT */}
                    <div className="space-y-4">
                      <div className="p-8 rounded-4xl border-2 border-slate-50 bg-white flex items-center justify-between shadow-sm hover:border-purple-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Waktu dan Tempat Pelaksanaan</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Muncul di surat pengantar proposal jika diaktifkan.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${formData.waktuTempatAktif ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {formData.waktuTempatAktif ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                          <Switch 
                            checked={formData.waktuTempatAktif} 
                            onCheckedChange={(val) => setFormData({...formData, waktuTempatAktif: val})}
                          />
                        </div>
                      </div>

                      {formData.waktuTempatAktif && (
                        <div className="p-8 rounded-4xl bg-purple-50/30 border-2 border-purple-100/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-purple-800/60">Hari</Label>
                                <Input className="h-12 rounded-2xl bg-white border-purple-100 focus:ring-purple-500/20" placeholder="Senin" value={formData.hariAcara} onChange={e => setFormData({...formData, hariAcara: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-purple-800/60">Tanggal</Label>
                                <Input className="h-12 rounded-2xl bg-white border-purple-100 focus:ring-purple-500/20" placeholder="10 Januari 2026" value={formData.tanggalAcara} onChange={e => setFormData({...formData, tanggalAcara: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-purple-800/60">Waktu</Label>
                                <Input className="h-12 rounded-2xl bg-white border-purple-100 focus:ring-purple-500/20" placeholder="09:00 WIB s/d Selesai" value={formData.waktuAcara} onChange={e => setFormData({...formData, waktuAcara: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-purple-800/60">Tempat</Label>
                                <Input className="h-12 rounded-2xl bg-white border-purple-100 focus:ring-purple-500/20" placeholder="Masjid Al-Muhajirin" value={formData.lokasiAcara} onChange={e => setFormData({...formData, lokasiAcara: e.target.value})} />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-purple-800/60">Nama Kegiatan / Agenda Utama</Label>
                              <Input className="h-12 rounded-2xl bg-white border-purple-100 focus:ring-purple-500/20" placeholder="Contoh: Peringatan Hari Besar Islam" value={formData.namaAcara} onChange={e => setFormData({...formData, namaAcara: e.target.value})} />
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setActiveTab('struktur')} className="h-11 px-8 rounded-full bg-purple-100 text-purple-700 font-black uppercase tracking-widest text-[10px] hover:bg-purple-200 group">
                        Lanjut ke Struktur <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* TAB: Struktur */}
                  <TabsContent value="struktur" className="mt-6 space-y-12">
                    {/* Section: Board of Directors / Pimpinan Utama */}
                    <div className="relative">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden md:block" />
                      
                      <div className="space-y-8 relative">
                        <div className="flex flex-col items-center mb-10">
                          <div className="h-12 w-12 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 mb-4 animate-bounce">
                            <Users className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest text-center">Pimpinan Utama</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Penanggung Jawab & Penasehat</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm hover:border-indigo-100 transition-colors group">
                             <div className="flex items-center gap-4 mb-6">
                               <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                 <CheckSquare className="h-5 w-5" />
                               </div>
                               <div>
                                 <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Pelindung</Label>
                                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Ketua RW 03</span>
                               </div>
                             </div>
                             <Input className="h-14 rounded-2xl bg-slate-50/50 border-none font-black text-sm px-6 focus:bg-white" placeholder="Nama Pelindung (RW)..." value={formData.pelindungRW} onChange={e => setFormData({...formData, pelindungRW: e.target.value})} />
                          </div>

                          <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm hover:border-indigo-100 transition-colors group">
                             <div className="flex items-center gap-4 mb-6">
                               <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                 <PenTool className="h-5 w-5" />
                               </div>
                               <div>
                                 <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Penasehat</Label>
                                 <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Ketua RT 02</span>
                               </div>
                             </div>
                             <Input className="h-14 rounded-2xl bg-slate-50/50 border-none font-black text-sm px-6 focus:bg-white" placeholder="Nama Penasehat (RT)..." value={formData.penasehatRT} onChange={e => setFormData({...formData, penasehatRT: e.target.value})} />
                          </div>
                        </div>

                        <div className="max-w-md mx-auto p-8 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm hover:border-emerald-100 transition-colors group">
                           <div className="flex items-center gap-4 mb-6">
                             <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                               <Users className="h-5 w-5" />
                             </div>
                             <div>
                               <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block">Ketua Pemuda</Label>
                               <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Koordinator Lapangan</span>
                             </div>
                           </div>
                           <Input className="h-14 rounded-2xl bg-slate-50/50 border-none font-black text-sm px-6 focus:bg-white" placeholder="Nama Ketua Pemuda..." value={formData.ketuaPemudaStruktur} onChange={e => setFormData({...formData, ketuaPemudaStruktur: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Operational Core / Pengurus Harian */}
                    <div className="pt-12 border-t-2 border-dashed border-slate-100">
                      <div className="flex flex-col items-center mb-10">
                        <div className="h-12 w-12 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 mb-4">
                          <Layout className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest text-center">Pengurus Harian</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Administrasi & Keuangan</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-4xl bg-white border border-slate-100 shadow-sm space-y-4">
                           <Label className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em] block text-center italic">Sekretaris Utama</Label>
                           <Input className="h-12 rounded-2xl bg-slate-50/80 border-none font-bold text-center text-xs" placeholder="Nama Sekretaris..." value={formData.sekretarisStruktur} onChange={e => setFormData({...formData, sekretarisStruktur: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-4xl bg-white border border-slate-100 shadow-sm space-y-4">
                           <Label className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em] block text-center italic">Bendahara Utama</Label>
                           <Input className="h-12 rounded-2xl bg-slate-50/80 border-none font-bold text-center text-xs" placeholder="Nama Bendahara..." value={formData.bendaharaStruktur} onChange={e => setFormData({...formData, bendaharaStruktur: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* Section: Divisi Operasional (Anggota) */}
                    <div className="pt-12 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-[1.2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Plus className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Divisi Operasional</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase italic">Anggota Pelaksana Lapangan</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={addAnggota} className="rounded-full border-emerald-100 text-emerald-600 font-black uppercase text-[9px] px-6 h-9 hover:bg-emerald-50">
                          <Plus className="h-3 w-3 mr-2" /> Tambah Anggota
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.anggotaList.map((item, idx) => (
                           <div key={idx} className="relative group animate-in zoom-in-95 duration-200">
                             <Input 
                                placeholder={`Anggota ${idx + 1}`} 
                                className="bg-white rounded-2xl h-12 border-slate-100 shadow-sm font-bold text-xs pl-12 focus:ring-2 focus:ring-emerald-500/20"
                                value={item}
                                onChange={(e) => updateAnggota(idx, e.target.value)}
                             />
                             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-black italic text-sm group-hover:text-emerald-500 transition-colors">
                               {String(idx + 1).padStart(2, '0')}
                             </div>
                           </div>
                        ))}
                        {formData.anggotaList.length === 0 && (
                          <div className="col-span-full h-24 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 text-[10px] font-black uppercase italic tracking-widest bg-slate-50/50">
                            Belum ada anggota divisi ditambahkan
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-10 border-t border-slate-100">
                      <Button variant="ghost" onClick={() => setActiveTab('umum')} className="text-slate-400 group font-black uppercase text-[10px] tracking-widest">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                      </Button>
                      <Button onClick={() => setActiveTab('rab')} className="h-12 px-10 rounded-full bg-linear-to-r from-indigo-600 to-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-indigo-100 group transition-all">
                        Lanjut ke RAB <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* TAB: RAB */}
                  <TabsContent value="rab" className="mt-6 space-y-12">
                     {/* Summary Card */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="col-span-2 rounded-[2.5rem] bg-indigo-600 p-8 shadow-xl shadow-indigo-100 flex items-center justify-between text-white overflow-hidden relative">
                           <div className="absolute top-0 right-0 h-full w-48 bg-white/10 skew-x-30 translate-x-12" />
                           <div className="relative">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Total Estimasi Anggaran</p>
                              <h2 className="text-4xl font-black tracking-tight">IDR {totalRAB.toLocaleString('id-ID')}</h2>
                           </div>
                           <div className="h-16 w-16 rounded-3xl bg-white/20 flex items-center justify-center relative backdrop-blur-md">
                              <DollarSign className="h-8 w-8" />
                           </div>
                        </Card>
                        <div className="p-8 rounded-[2.5rem] bg-emerald-50 border-2 border-emerald-100 flex flex-col justify-center items-center text-center space-y-2">
                           <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Jumlah Item</p>
                           <h3 className="text-3xl font-black text-emerald-600">{formData.rabItems.length}</h3>
                           <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Keperluan Terdata</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-[1.2rem] bg-slate-900 text-white flex items-center justify-center">
                                 <Plus className="h-5 w-5" />
                              </div>
                              <h3 className="text-xl font-black text-slate-800 tracking-wider">Daftar Kebutuhan</h3>
                           </div>
                           <Button onClick={addRABItem} className="h-11 px-8 rounded-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200">
                              <Plus className="h-3 w-3 mr-2" /> Tambah Barang / Jasa
                           </Button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                           <div className="p-8 pb-0">
                             <div className="grid grid-cols-12 gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">
                                <div className="col-span-5">Deskripsi Item & Spesifikasi</div>
                                <div className="col-span-2 text-center">Kuantitas</div>
                                <div className="col-span-2 text-right">Biaya Satuan</div>
                                <div className="col-span-3 text-right">Subtotal</div>
                             </div>
                           </div>
                           
                           <div className="p-4 space-y-3">
                              {formData.rabItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-6 items-center p-4 rounded-2xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group">
                                  <div className="col-span-5 flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-black italic text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                      {idx + 1}
                                    </div>
                                    <Input className="h-12 border-none bg-transparent font-bold text-sm focus:ring-0 placeholder:font-normal placeholder:italic" placeholder="Contoh: ATK & Dokumentasi" value={item.item} onChange={e => updateRABItem(idx, 'item', e.target.value)} />
                                  </div>
                                  <div className="col-span-2">
                                    <div className="relative">
                                      <Input className="h-12 rounded-xl bg-slate-50/50 border-none text-center font-black text-xs pr-8" placeholder="0" value={item.jumlah} onChange={e => updateRABItem(idx, 'jumlah', e.target.value)} />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">QTY</span>
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="relative">
                                      <Input className="h-12 rounded-xl bg-slate-50/50 border-none text-right font-black text-xs pl-8" placeholder="0" type="number" value={item.harga} onChange={e => updateRABItem(idx, 'harga', e.target.value)} />
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold uppercase tracking-tighter">IDR</span>
                                    </div>
                                  </div>
                                  <div className="col-span-3 flex items-center justify-end gap-3">
                                    <div className="text-right">
                                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Total</p>
                                      <p className="font-black text-indigo-900 text-sm">IDR {item.total.toLocaleString('id-ID')}</p>
                                    </div>
                                    <Button onClick={() => setFormData(prev => ({ ...prev, rabItems: prev.rabItems.filter((_, i) => i !== idx) }))} variant="ghost" size="icon" className="h-10 w-10 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all">
                                      <Plus className="h-4 w-4 rotate-45" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {formData.rabItems.length === 0 && (
                                <div className="h-48 border-2 border-dashed border-slate-50 rounded-4xl flex flex-col items-center justify-center space-y-4 bg-slate-50/20">
                                   <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                      <DollarSign className="h-6 w-6" />
                                   </div>
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Daftar Anggaran Masih Kosong</p>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Lampiran Photo Section */}
                     <div className="pt-12 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-[1.2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                 <FileText className="h-5 w-5" />
                              </div>
                              <h3 className="text-xl font-black text-slate-800 tracking-wider">Lampiran Pendukung</h3>
                           </div>
                           <Button variant="outline" className="h-10 px-6 rounded-full border-indigo-100 text-indigo-600 font-black uppercase text-[9px] tracking-widest hover:bg-indigo-50">
                              <Upload className="h-3 w-3 mr-2" /> Upload Dokumen/Foto
                           </Button>
                        </div>
                        <Card className="rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-100 p-16 text-center group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all duration-300">
                           <div className="flex flex-col items-center space-y-4">
                              <div className="h-14 w-14 rounded-full bg-white shadow-xl shadow-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                                 <Plus className="h-8 w-8" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-xs font-black text-slate-400 group-hover:text-slate-800 transition-colors">SERET & LEPAS FILE DISINI</p>
                                 <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Maksimal 5MB per file (JPG, PNG, PDF)</p>
                              </div>
                           </div>
                        </Card>
                     </div>

                    <div className="flex justify-between pt-10 border-t border-slate-100">
                      <Button variant="ghost" onClick={() => setActiveTab('struktur')} className="text-slate-400 group font-black uppercase text-[10px] tracking-widest">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                      </Button>
                      <Button onClick={() => setActiveTab('penutup')} className="h-12 px-10 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-purple-100 group transition-all">
                        Lanjut ke Penutup <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </TabsContent>

                  {/* TAB: Penutup */}
                  <TabsContent value="penutup" className="mt-6 space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-black uppercase text-slate-600 tracking-widest">Kalimat Penutup</Label>
                           <Button 
  onClick={() => handleAiGenerate('kalimatPenutup')} 
  disabled={isAiLoading === 'kalimatPenutup'}
  variant="ghost" 
  className="text-purple-600 font-bold text-[10px] uppercase flex items-center gap-1.5"
>
  {isAiLoading === 'kalimatPenutup' ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
  Generate AI
</Button>
                        </div>
                        <Textarea 
                          className={`min-h-[160px] rounded-3xl border-slate-200 p-6 shadow-sm bg-white font-serif transition-all duration-500 ${isAiLoading === 'kalimatPenutup' ? 'animate-pulse border-purple-400 ring-4 ring-purple-50' : ''}`}
                          placeholder="Tuliskan kalimat penutup..." 
                          value={formData.kalimatPenutup} 
                          onChange={e => setFormData({...formData, kalimatPenutup: e.target.value})} 
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Lokasi Penerbitan</Label>
                           <Input className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm" value={formData.lokasiPenerbitan} onChange={e => setFormData({...formData, lokasiPenerbitan: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-slate-500 tracking-widest">Tanggal Surat</Label>
                           <Input className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm" value={new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} readOnly />
                        </div>
                     </div>

                     <div className="space-y-8 pt-6">
                        <div className="flex items-center gap-2">
                           <div className="h-8 w-2 bg-purple-600 rounded-full" />
                           <h3 className="text-lg font-black text-slate-800 tracking-tight">Nama Penandatangan (Dibuat & Mengetahui)</h3>
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {[
                             { label: 'Sekretaris DKM', field: 'ttdSekretarisDKM', required: true, icon: <Layout className="h-4 w-4" /> },
                             { label: 'Ketua DKM', field: 'ttdKetuaDKM', required: true, icon: <Layout className="h-4 w-4" /> },
                             { label: 'Bendahara DKM', field: 'ttdBendaharaDKM', required: true, icon: <DollarSign className="h-4 w-4" /> },
                             { label: 'Tokoh Masyarakat', field: 'ttdTokohMasyarakat', subLabel: 'Masjid Al-Muhajirin', icon: <Users className="h-4 w-4" /> },
                             { label: 'Ketua RW', field: 'ttdKetuaRW', icon: <Users className="h-4 w-4" /> },
                             { label: 'Ketua RT', field: 'ttdKetuaRT', icon: <Users className="h-4 w-4" /> },
                             { label: 'Ketua Pemuda', field: 'ttdKetuaPemuda', icon: <Users className="h-4 w-4" /> },
                             { label: 'Guru Besar', field: 'ttdGuruBesar', icon: <PenTool className="h-4 w-4" /> },
                             { label: 'Ketua Padepokan', field: 'ttdKetuaPadepokan', icon: <PenTool className="h-4 w-4" /> },
                             { label: 'Ketua DPD Bandrong', field: 'ttdKetuaDPDBandrong', icon: <PenTool className="h-4 w-4" /> },
                           ].map((item, idx) => (
                             <div key={idx} className="p-6 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                               <div className="flex items-center gap-2 mb-4">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${(item as any).required ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 opacity-50 group-hover:opacity-100'}`}>
                                    {(item as any).icon}
                                  </div>
                                  <div>
                                    <Label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">{item.label}</Label>
                                    {(item as any).subLabel && <span className="text-[8px] text-slate-300 uppercase block font-bold leading-none">{(item as any).subLabel}</span>}
                                  </div>
                               </div>
                               <div className="flex flex-col gap-2">
                                  <Select onValueChange={(val) => {
                                      setFormData(prev => ({ ...prev, [(item as any).field]: val }))
                                  }}>
                                     <SelectTrigger className="h-9 mb-1 text-xs rounded-xl bg-slate-50 border-none">
                                         <SelectValue placeholder="Pilih dari Struktur..." />
                                     </SelectTrigger>
                                     <SelectContent>
                                         <SelectItem value=" ">Reset / Manual</SelectItem>
                                         {strukturOrganisasi.map((s, idx) => (
                                             <SelectItem key={idx} value={s.name}>
                                                 <div className="flex flex-col text-left">
                                                     <span className="font-bold text-xs">{s.name}</span>
                                                     <span className="text-[9px] text-slate-400">{s.position}</span>
                                                 </div>
                                             </SelectItem>
                                         ))}
                                     </SelectContent>
                                  </Select>

                                  <Input 
                                    className="h-12 rounded-2xl border-none bg-slate-50/50 focus:bg-white text-center font-black text-xs tracking-tight placeholder:italic placeholder:font-normal" 
                                    placeholder={`Nama ${(item as any).label}...`}
                                    value={(formData as any)[(item as any).field]} 
                                    onChange={e => setFormData({...formData, [(item as any).field]: e.target.value})} 
                                  />
                               </div>
                             </div>
                           ))}
                         </div>
                     </div>

                     <div className="flex justify-between pt-10">
                        <Button variant="ghost" onClick={() => setActiveTab('rab')} className="text-slate-400 group">
                          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                        </Button>
                        <Button type="button" onClick={handleSubmit} className="h-14 px-12 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-100 animate-pulse">
                           Ajukan Proposal <ArrowRight className="h-4 w-4 ml-3" />
                        </Button>
                     </div>
                  </TabsContent>
                  
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
                        <a href="/template_penerima_proposal.xlsx" download>
                           <Button variant="outline" size="sm" className="h-7 text-[9px] uppercase font-bold rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 gap-2">
                              <FileDown className="h-3 w-3" /> TEMPLATE EXCEL
                           </Button>
                        </a>
                        <Button variant="outline" size="sm" className="h-7 text-[9px] uppercase font-bold rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 gap-2">
                           <Upload className="h-3 w-3" /> Upload Excel
                        </Button>
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

                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">Detail Acara (Opsional)</Label>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold transition-colors ${formData.waktuTempatAktif ? 'text-orange-600' : 'text-gray-400'}`}>
                              {formData.waktuTempatAktif ? 'Ditampilkan' : 'Disembunyikan'}
                            </span>
                            <Switch 
                              checked={formData.waktuTempatAktif} 
                              onCheckedChange={(val) => setFormData({...formData, waktuTempatAktif: val})} 
                            />
                          </div>
                        </div>

                        {formData.waktuTempatAktif && (
                          <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                      </div>

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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block">Sekretaris DKM</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Sekretaris" value={formData.ttdSekretarisDKM} onChange={e => setFormData({...formData, ttdSekretarisDKM: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block">Ketua DKM</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Ketua" value={formData.ttdKetuaDKM} onChange={e => setFormData({...formData, ttdKetuaDKM: e.target.value})} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-blue-600 tracking-widest block">Mengetahui (Tokoh Masyarakat)</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Tokoh" value={formData.ttdTokohMasyarakat} onChange={e => setFormData({...formData, ttdTokohMasyarakat: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 space-y-3">
                           <Label className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest italic text-center">Tanda Tangan Lainnya bisa diatur di tab Penutup pada tipe Proposal</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="button" onClick={handleSubmit} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                    Simpan & Ajukan Dokumen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DIGITAL PREVIEW */}
          <div className={`w-full lg:w-3/5 bg-[#f8fafc] p-4 lg:p-12 overflow-y-auto lg:sticky lg:top-0 lg:h-screen ${showPreview ? 'block' : 'hidden lg:block'}`}>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-8 no-print bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Live Preview</h2>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black px-2 py-0">LIVE</Badge>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={generatePreviewPDF} 
                      disabled={documentStatus !== 'validated'}
                      className="h-10 rounded-2xl bg-[#1e293b] text-white hover:bg-black transition-all shadow-lg shadow-slate-200 gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" /> 
                      <span className="text-[10px] font-black uppercase tracking-widest">Unduh PDF</span>
                    </Button>
                  </div>
                  {documentStatus !== 'validated' && (
                    <p className="text-[9px] text-amber-600 font-bold italic">
                      * Download aktif setelah disetujui Admin/Ketua/Tokoh
                    </p>
                  )}
                </div>
              </div>

              {/* PAPER PREVIEW - PAGE 1 */}
              <div 
                ref={previewRef}
                className="pdf-page bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm p-12 lg:p-16 min-h-[1123px] w-full relative overflow-hidden flex flex-col mx-auto"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* LOGO & KOP */}
                <div className="flex items-center gap-6 border-b-[3px] border-[#0b3d2e] pb-4 mb-8">
                  <div className="h-24 w-24 shrink-0">
                    <img 
                      src="/logo.png" 
                      alt="Logo DKM" 
                      className="w-full h-full object-contain"
                      onError={(e: any) => e.target.style.display = 'none'}
                    />
                  </div>
                  <div className="text-center flex-1 pr-12">
                    <h1 className="font-bold text-[#0b3d2e] text-2xl leading-tight uppercase tracking-tight mb-1">
                      {formData.namaKopSurat || 'DEWAN KEMAKMURAN MASJID (DKM)\nAL-MUHAJIRIN KP. RAGAS GRENYANG'}
                    </h1>
                    <p className="text-xs text-slate-700 font-medium leading-tight">
                      {formData.alamatKopSurat || 'Desa Argawana, Kecamatan Puloampel Kabupaten Serang Provinsi Banten 42455'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      Email: dkm_almuhajirin@gmail.com / Website: dkm-almuhajirin-ragas.vercel.app
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div className="flex justify-between items-start text-[12pt] mb-10 leading-relaxed">
                  <div className="space-y-1">
                    <div className="flex"><span className="w-20 inline-block">Nomor</span><span>: <span className="font-bold">{formData.nomorSurat}</span></span></div>
                    <div className="flex"><span className="w-20 inline-block">Lampiran</span><span>: <span>{formData.lampiran || '-'}</span></span></div>
                    <div className="flex"><span className="w-20 inline-block">Perihal</span><span>: <span className="font-bold capitalize">{formData.perihal || '...'}</span></span></div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="font-bold">{formData.tempatSurat}, {new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* RECIPIENT */}
                <div className="text-[12pt] mb-10 leading-relaxed">
                  <p className="font-bold">Kepada Yth.</p>
                  <div className="mt-1 border-b border-black/10 inline-block pb-1 min-w-[200px]">
                    <p className="font-bold uppercase text-[12pt] tracking-tight">{formData.penerimaNama || '............................'}</p>
                  </div>
                  {formData.penerimaJabatan && <p className="italic text-slate-700">{formData.penerimaJabatan}</p>}
                  <p className="mt-2 font-bold italic">di - <span className="border-b border-black/20 pb-0.5">{formData.penerimaLokasi || 'Tempat'}</span></p>
                </div>

                {/* CONTENT */}
                <div className="text-[12pt] space-y-6 text-slate-900 leading-[1.8] flex-1 font-serif">
                  {type === 'PROPOSAL' ? (
                    <>
                      <div className="whitespace-pre-wrap text-justify">{formData.isiSuratPengantar || '[Isi Surat Pengantar Belum Diisi]'}</div>
                      
                      {formData.waktuTempatAktif && (
                        <div className="ml-4 md:ml-12 my-6">
                           <table className="w-full text-[12pt] leading-normal">
                             <tbody>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Hari, Tanggal</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">
                                    {formData.hariAcara || ''}
                                    {(formData.hariAcara && formData.tanggalAcara) ? ', ' : ''}
                                    {formData.tanggalAcara || ''}
                                  </td>
                               </tr>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Waktu</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">{formData.waktuAcara}</td>
                               </tr>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Tempat</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">{formData.lokasiAcara}</td>
                               </tr>
                               {formData.namaAcara && (
                                 <tr>
                                    <td className="w-32 align-top py-1 text-slate-900">Acara</td>
                                    <td className="w-4 align-top py-1 text-slate-900">:</td>
                                    <td className="align-top py-1 text-slate-900 font-bold">{formData.namaAcara}</td>
                                 </tr>
                               )}
                             </tbody>
                           </table>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap text-justify text-[12pt] leading-[1.8]">{formData.kalimatPenutup}</div>
                    </>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap text-justify">{formData.pembuka}</div>

                      {formData.waktuTempatAktif && (
                        <div className="ml-4 md:ml-12 my-6">
                           <table className="w-full text-[12pt] leading-normal">
                             <tbody>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Hari, Tanggal</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">
                                    {formData.hariAcara || ''}
                                    {(formData.hariAcara && formData.tanggalAcara) ? ', ' : ''}
                                    {formData.tanggalAcara || ''}
                                  </td>
                               </tr>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Waktu</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">{formData.waktuAcara}</td>
                               </tr>
                               <tr>
                                  <td className="w-32 align-top py-1 text-slate-900">Tempat</td>
                                  <td className="w-4 align-top py-1 text-slate-900">:</td>
                                  <td className="align-top py-1 text-slate-900 font-bold">{formData.lokasiAcara}</td>
                               </tr>
                             </tbody>
                           </table>
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap text-justify text-[12pt] leading-[1.8]">{formData.penutup}</div>
                    </>
                  )}
                </div>

                {/* SIGNATURES - FIXED LAYOUT */}
                <div className="mt-16 mb-20 px-4">
                   <div className="grid grid-cols-2 gap-10 text-[12pt]">
                      {/* Kiri: Sekretaris */}
                      <div className="flex flex-col items-center justify-between min-h-[140px]">
                        <p className="uppercase font-bold tracking-wider text-center text-slate-900">SEKRETARIS DKM,</p>
                        <div className="mt-20 text-center">
                          <p className="font-bold text-slate-900 underline underline-offset-4 decoration-1 tracking-tight uppercase">
                            {formData.ttdSekretarisDKM || '............................'}
                          </p>
                        </div>
                      </div>

                      {/* Kanan: Ketua */}
                      <div className="flex flex-col items-center justify-between min-h-[140px]">
                        <p className="uppercase font-bold tracking-wider text-center text-slate-900">KETUA DKM,</p>
                        <div className="mt-20 text-center">
                          <p className="font-bold text-slate-900 underline underline-offset-4 decoration-1 tracking-tight uppercase">
                            {formData.ttdKetuaDKM || '............................'}
                          </p>
                        </div>
                      </div>
                   </div>

                   {/* Tengah: Mengetahui (Jika ada) */}
                   {formData.ttdTokohMasyarakat && (
                      <div className="mt-12 flex flex-col items-center text-[12pt]">
                        <div className="flex flex-col items-center justify-between min-h-[140px] w-fit">
                          <div className="text-center">
                            <p className="normal-case italic text-[11pt] text-slate-600 mb-1">Mengetahui,</p>
                            <p className="uppercase font-bold tracking-wider text-slate-900">Tokoh Masyarakat</p>
                          </div>
                          <div className="mt-20 text-center">
                            <p className="font-bold text-slate-900 underline underline-offset-4 decoration-1 tracking-tight uppercase">
                              {formData.ttdTokohMasyarakat}
                            </p>
                          </div>
                        </div>
                      </div>
                   )}
               </div>

                {/* FOOTER */}
                <div className="absolute bottom-10 left-12 right-12 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-sans uppercase font-black tracking-widest">
                  <span>DKM Al-Muhajirin Ragas Grenyang</span>
                  <span>Halaman 1 dari {type === 'PROPOSAL' ? '5' : '1'}</span>
                </div>
              </div>

              {/* PAPER PREVIEW - PAGE 2 (PENDALUAN - Only for PROPOSAL) */}
              {type === 'PROPOSAL' && (
                <>
                  <div className="pdf-page bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden mb-8">
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-10">
                      <div className="text-center flex-1 px-4">
                        <h1 className="font-black text-slate-900 text-sm leading-tight uppercase tracking-tight">{formData.namaKopSurat}</h1>
                      </div>
                      <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-[6px] font-bold text-slate-300 uppercase">Logo</div>
                    </div>

                  <div className="space-y-8 text-[11px] text-slate-900 font-serif">
                    <div>
                      <h2 className="text-sm font-black mb-4">I. PENDAHULUAN</h2>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold mb-2">A. Latar Belakang</h3>
                          <p className="whitespace-pre-wrap leading-relaxed">{formData.latarBelakang || '..............................................'}</p>
                        </div>
                        <div>
                          <h3 className="font-bold mb-2">B. Maksud Dan Tujuan</h3>
                          <div className="space-y-2 ml-4">
                             {formData.maksudTujuanList.map((item, idx) => (
                               <p key={idx} className="leading-relaxed">{idx + 1}. {item}</p>
                             ))}
                             {formData.maksudTujuanList.length === 0 && <p>..............................................</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  <div id="proposal-page-3" className="pdf-page bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden">
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-10">
                      <div className="text-center flex-1 px-4">
                        <h1 className="font-black text-slate-900 text-sm leading-tight uppercase tracking-tight">{formData.namaKopSurat}</h1>
                      </div>
                    </div>
                  <div className="space-y-8 text-[11px] text-slate-900 font-serif">
                    <div>
                      <h2 className="text-sm font-black mb-4 uppercase">II. Struktur Organisasi</h2>
                      <div className="grid grid-cols-2 gap-4 italic text-slate-600">
                        <p>Pelindung (RW): {formData.pelindungRW || '...'}</p>
                        <p>Penasehat (RT): {formData.penasehatRT || '...'}</p>
                        <p>Ketua Pemuda: {formData.ketuaPemudaStruktur || '...'}</p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-black mb-4 uppercase">III. Anggaran Biaya (RAB)</h2>
                      <table className="w-full border-collapse">
                         <thead>
                            <tr className="border-b border-slate-200 text-left text-[9px] uppercase tracking-widest text-slate-400">
                              <th className="py-2">Item</th>
                              <th className="py-2 text-right">Total</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {formData.rabItems.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-2">{item.item || '...'}</td>
                                <td className="py-2 text-right font-bold text-slate-900">Rp {item.total.toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                         </tbody>
                         <tfoot>
                            <tr className="border-t-2 border-slate-900 font-bold">
                              <td className="py-4 uppercase">Total Estimasi</td>
                              <td className="py-4 text-right underline underline-offset-4">Rp {totalRAB.toLocaleString('id-ID')}</td>
                            </tr>
                         </tfoot>
                      </table>
                    </div>
                  </div>
                  </div>
                </>
              )}
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
