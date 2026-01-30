'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Users, 
  FileCheck,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Calendar,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminLayout } from '@/components/layout/admin-layout'
import { useSession } from 'next-auth/react'

const IDR = ({ className }: { className?: string }) => (
  <div className={`${className} font-bold text-[10px] flex items-center justify-center`}>Rp</div>
)

// --- Types ---
interface Pimpinan {
  role: string
  name: string
}

interface RABItem {
  nama: string
  spesifikasi: string
  jumlah: number
  satuan: string
  hargaSatuan: number
  totalHarga: number
}

interface ProposalFoto {
  url: string
  deskripsi: string
}

interface ProposalData {
  nomor: string
  lampiran: string
  perihal: string
  penerima: {
    nama: string
    jabatan: string
    instansi: string
    alamat: string
  }
  latarBelakang: string
  suratPengantar: string
  tujuan: string[]
  struktur: {
    pimpinanAtas: Pimpinan[]
    administrasi: Pimpinan[]
    operasional: string[]
  }
  rab: RABItem[]
  tanggal: string
  tempat: string
  namaKetua: string
  namaSekretaris: string
  namaBendahara: string
  namaTokohMasyarakat: string
  namaKetuaRW: string
  namaKetuaRT: string
  namaKetuaPemuda: string
  logoKiri?: string
  logoKanan?: string
  namaKopSurat: string
  alamatKopSurat: string
  kontakKopSurat: string
  penutup: string
  bulkRecipients?: { nama: string, jabatan: string, alamat: string }[]
  lampiranFoto: ProposalFoto[]
  waktuKegiatan: string
  tempatKegiatan: string
  showWaktuTempat: boolean
}

const initialData: ProposalData = {
  namaKopSurat: 'DEWAN KEMAKMURAN MASJID (DKM) AL-MUHAJIRIN RAGAS GRENYANG',
  alamatKopSurat: 'Kampung Ragas Grenyang, Desa Argawana\nKecamatan Puloampel Kabupaten\nSerang-Banten 42455',
  kontakKopSurat: 'Email: dkm_almuhajirin@gmail.com | Website: dkm-almuhajirin-ragas.vercel.app',
  nomor: '',
  lampiran: '-',
  perihal: '',
  penerima: {
    nama: '',
    jabatan: '',
    instansi: '',
    alamat: ''
  },
  suratPengantar: 'Assalamu\'alaikum Wr. Wb. \n\nSalam silaturahmi kami sampaikan, teriring doa semoga bapak beserta keluarga selalu berada dalam lindungan Allah SWT, diberikan kesehatan, serta kelancaran dalam segala urusan.\n\nBersama dengan surat ini, kami selaku pengurus DKM Al-Muhajirin bermaksud untuk mengajukan permohonan dukungan dan bantuan dana untuk kegiatan yang akan kami laksanakan. Semoga bapak/ibu dapat memberikan dukungan positif demi kelancaran kegiatan tersebut.',
  penutup: 'Demikian proposal ini kami susun dengan harapan mendapatkan pertimbangan dan dukungan dari Bapak/Ibu. Atas perhatian dan kerjasamanya kami haturkan terima kasih yang sebesar-besarnya. Semoga Allah SWT membalas segala bentuk kebaikan Bapak/Ibu dengan pahala yang berlipat ganda.',
  latarBelakang: 'Masjid Al-Muhajirin merupakan pusat kegiatan keagamaan dan sosial bagi warga Ragas Grenyang. Dalam rangka meningkatkan kualitas pelayanan jamaah dan memakmurkan masjid, kami merencanakan kegiatan...',
  tujuan: [
    'Meningkatkan kualitas sarana ibadah',
    'Mempererat tali silaturahmi antar jamaah',
    'Menciptakan lingkungan yang religius dan nyaman'
  ],
  struktur: {
    pimpinanAtas: [
      { role: 'Ketua DKM', name: '' },
      { role: 'Mengetahui', name: 'Tokoh Masyarakat' }
    ],
    administrasi: [
      { role: 'Sekretaris', name: '' },
      { role: 'Bendahara', name: '' }
    ],
    operasional: []
  },
  rab: [],
  tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  tempat: 'Argawana',
  namaKetua: '',
  namaSekretaris: '',
  namaBendahara: '',
  namaTokohMasyarakat: '',
  namaKetuaRW: '',
  namaKetuaRT: '',
  namaKetuaPemuda: '',
  logoKiri: "/logo.png",
  logoKanan: "",
  lampiranFoto: [],
  waktuKegiatan: '',
  tempatKegiatan: '',
  showWaktuTempat: false
}

function ProposalBuilderContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const proposalId = searchParams.get('id')
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(!!proposalId)

  const [isViewMode, setIsViewMode] = useState(searchParams.get('mode') === 'view')
  
  const [data, setData] = useState<ProposalData>(initialData)
  const [activeTab, setActiveTab] = useState('umum')
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null)
  const [history, setHistory] = useState<Partial<ProposalData>>({})
  const [bulkRecipients, setBulkRecipients] = useState<{ nama: string, jabatan: string, alamat: string }[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  const [proposalStatus, setProposalStatus] = useState<string>('pending')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [tempRejectionReason, setTempRejectionReason] = useState('')
  
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (dateInput) {
        const date = new Date(dateInput)
        const formatted = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        setData(prev => ({ ...prev, tanggal: formatted }))
    }
  }, [dateInput])

  useEffect(() => {
    if (proposalId) {
      fetchExistingProposal()
    } else {
      setData(initialData)
      setBulkRecipients([])
      setProposalStatus('pending')
      setRejectionReason('')
      setIsLoadingInitialData(false)
    }
  }, [proposalId])

  const fetchExistingProposal = async () => {
    try {
      const res = await fetch(`/api/admin/persuratan`)
      const list = await res.json()
      const item = list.find((d: any) => d.id === proposalId)
      
      if (item && item.content) {
        try {
          const parsed = JSON.parse(item.content)
          setData({ ...initialData, ...parsed })
          if (parsed.bulkRecipients) {
            setBulkRecipients(parsed.bulkRecipients)
          }
          setProposalStatus(item.status)
          if (item.status === 'validated' || searchParams.get('mode') === 'view') {
            setIsViewMode(true)
          }
          if (item.date) {
            setDateInput(new Date(item.date).toISOString().split('T')[0])
          }
          if (item.rejectionNote) setRejectionReason(item.rejectionNote)
        } catch (e) {
          console.error('Failed to parse proposal JSON', e)
        }
      }
    } catch (error) {
      toast.error('Gagal mengambil data proposal')
    } finally {
        setIsLoadingInitialData(false)
    }
  }

  const updateStrukturName = (category: 'pimpinanAtas' | 'administrasi', index: number, name: string) => {
    setData(prev => {
      const newStruktur = { ...prev.struktur }
      newStruktur[category][index].name = name
      
      const updates: Partial<ProposalData> = { struktur: newStruktur }
      
      if (category === 'pimpinanAtas' && index === 0) updates.namaKetua = name
      if (category === 'pimpinanAtas' && index === 1) updates.namaTokohMasyarakat = name
      if (category === 'administrasi' && index === 0) updates.namaSekretaris = name
      if (category === 'administrasi' && index === 1) updates.namaBendahara = name
      
      return { ...prev, ...updates }
    })
  }

  const handleAiGenerate = async (type: string) => {
    setIsAiLoading(type)
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const templates: Record<string, any> = {
      background: "Sehubungan dengan meningkatnya kebutuhan akan sarana ibadah yang memadai dan upaya untuk meningkatkan ukhuwah islamiyah di lingkungan Kp. Ragas Grenyang, maka kami memandang perlu untuk mengadakan kegiatan/pembangunan ini sebagai bagian dari program kerja tahunan DKM Al-Muhajirin. Mengingat pentingnya peran masjid sebagai pusat peradaban umat, kami berkomitmen untuk terus meningkatkan fasilitas dan kualitas pelayanan bagi seluruh jamaah.",
      'cover-letter': "Assalamu'alaikum Wr. Wb. \n\nSalam silaturahmi kami sampaikan, teriring doa semoga bapak beserta keluarga selalu berada dalam lindungan Allah SWT, diberikan kesehatan, serta kelancaran dalam segala urusan.\n\nBersama dengan surat ini, kami selaku pengurus DKM Al-Muhajirin bermaksud untuk mengajukan permohonan dukungan dan bantuan dana untuk kegiatan yang akan kami laksanakan. Semoga bapak/ibu dapat memberikan dukungan positif demi kelancaran kegiatan tersebut.",
      closing: "Demikian proposal ini kami susun dengan harapan mendapatkan pertimbangan dan dukungan dari Bapak/Ibu. Atas perhatian dan kerjasamanya kami haturkan terima kasih yang sebesar-besarnya. Semoga Allah SWT membalas segala bentuk kebaikan Bapak/Ibu dengan pahala yang berlipat ganda.",
      objectives: [
        'Meningkatkan kualitas sarana ibadah agar lebih nyaman bagi jamaah',
        'Mempererat tali silaturahmi antar jamaah melalui kegiatan bersama',
        'Menciptakan lingkungan yang religius dan kondusif untuk dakwah',
        'Meningkatkan syiar Islam di lingkungan Kp. Ragas Grenyang'
      ]
    }

    if (type === 'objectives') {
      setData(prev => ({ ...prev, tujuan: templates.objectives }))
    } else if (type === 'background') {
      setData(prev => ({ ...prev, latarBelakang: templates.background }))
    } else if (type === 'cover-letter') {
      setData(prev => ({ ...prev, suratPengantar: templates['cover-letter'] }))
    } else if (type === 'closing') {
      setData(prev => ({ ...prev, penutup: templates.closing }))
    }

    setIsAiLoading(null)
    toast.success('Rekomendasi AI berhasil diterapkan!')
  }

  const handleUndo = (type: 'background' | 'cover-letter' | 'closing') => {
      // Basic undo implementation if history exists
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'logoKiri' | 'logoKanan') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setData(prev => ({ ...prev, [side]: reader.result as string }))
        toast.success(`Logo ${side === 'logoKiri' ? 'Kiri' : 'Kanan'} berhasil diupdate`)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePenerimaChange = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      penerima: { ...prev.penerima, [field]: value }
    }))
  }

  const addTujuan = () => {
    setData(prev => ({
      ...prev,
      tujuan: [...prev.tujuan, '']
    }))
  }

  const updateTujuan = (index: number, value: string) => {
    const newTujuan = [...data.tujuan]
    newTujuan[index] = value
    setData(prev => ({ ...prev, tujuan: newTujuan }))
  }

  const removeTujuan = (index: number) => {
    setData(prev => ({
      ...prev,
      tujuan: prev.tujuan.filter((_, i) => i !== index)
    }))
  }

  const addRab = () => {
    setData(prev => ({
      ...prev,
      rab: [...prev.rab, { nama: '', spesifikasi: '', jumlah: 1, satuan: 'pcs', hargaSatuan: 0, totalHarga: 0 }]
    }))
  }

  const updateRab = (index: number, field: keyof RABItem, value: any) => {
    const newRab = [...data.rab]
    const item = { ...newRab[index], [field]: value }
    
    if (field === 'jumlah' || field === 'hargaSatuan') {
      item.totalHarga = (Number(item.jumlah) || 0) * (Number(item.hargaSatuan) || 0)
    }
    
    newRab[index] = item
    setData(prev => ({ ...prev, rab: newRab }))
  }

  const removeRab = (index: number) => {
    setData(prev => ({
      ...prev,
      rab: prev.rab.filter((_, i) => i !== index)
    }))
  }

  const calculateTotalRab = () => {
    return data.rab.reduce((acc, item) => acc + (item.totalHarga || 0), 0)
  }

  const addLampiranFoto = () => {
      setData(prev => ({
          ...prev,
          lampiranFoto: [...prev.lampiranFoto, { url: '', deskripsi: '' }]
      }))
  }

  const updateLampiranFoto = (index: number, field: keyof ProposalFoto, value: string) => {
      const newFotos = [...data.lampiranFoto]
      newFotos[index] = { ...newFotos[index], [field]: value }
      setData(prev => ({ ...prev, lampiranFoto: newFotos }))
  }

  const removeLampiranFoto = (index: number) => {
      setData(prev => ({
          ...prev,
          lampiranFoto: prev.lampiranFoto.filter((_, i) => i !== index)
      }))
  }

  const handleLampiranFotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
          const reader = new FileReader()
          reader.onloadend = () => {
              updateLampiranFoto(index, 'url', reader.result as string)
          }
          reader.readAsDataURL(file)
      }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = proposalId ? `/api/admin/persuratan/${proposalId}` : '/api/admin/persuratan'
      const method = proposalId ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.perihal || 'Proposal Tanpa Judul',
          type: 'PROPOSAL',
          date: new Date(dateInput).toISOString(),
          content: JSON.stringify({ ...data, bulkRecipients }),
          recipient: bulkRecipients.length > 0 ? `${bulkRecipients.length} Penerima` : data.penerima.nama,
          location: data.tempat,
          nomorSurat: data.nomor,
          status: 'pending'
        })
      })

      if (response.ok) {
        toast.success(proposalId ? 'Perubahan berhasil disimpan' : 'Proposal berhasil diajukan')
        setTimeout(() => router.push('/admin/persuratan'), 1500)
      } else {
        toast.error('Gagal menyimpan proposal')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const rawData = XLSX.utils.sheet_to_json(ws) as any[]
            
            const recipients = rawData.map((row) => ({
                nama: row['Nama'] || row['nama'] || '',
                jabatan: row['Jabatan'] || row['jabatan'] || '',
                alamat: row['Alamat'] || row['alamat'] || row['Tempat'] || row['tempat'] || ''
            })).filter(r => r.nama)

            setBulkRecipients(recipients)
            if (recipients.length > 0) {
                setCurrentRecipientIndex(0)
                toast.success(`Berhasil memuat ${recipients.length} penerima`)
            }
        }
        reader.readAsBinaryString(file)
    }
  }

  const generatePDF = async () => {
    if (!previewRef.current) return
    setIsGeneratingPDF(true)
    toast.info('Menyiapkan PDF...')

    try {
      await document.fonts.ready;
      const doc = new jsPDF('p', 'mm', 'a4')
      const pages = previewRef.current.querySelectorAll('.proposal-page')
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123,
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        if (i > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      }
      
      doc.save(`Proposal_${data.perihal.replace(/\s+/g, '_')}.pdf`)
      toast.success('PDF berhasil diunduh')
    } catch (error) {
      toast.error('Gagal membuat PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <AdminLayout title="Proposal Builder" subtitle="Buat proposal premium DKM Al-Muhajirin">
    <div className={isViewMode ? "" : "flex flex-col lg:flex-row gap-8 pb-20 mt-4"}>
      {!isViewMode && (
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-emerald-600 self-start" onClick={() => router.push('/admin/persuratan')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {proposalId ? 'Edit Proposal' : 'Pembuat Proposal Digital'}
            </h1>
            <p className="text-slate-500 font-medium italic">Format otomatis sesuai standar DKM Al-Muhajirin</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto md:h-16 w-full bg-slate-100 p-1.5 rounded-3xl mb-6 gap-1 md:gap-0">
            <TabsTrigger value="umum" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-xs md:text-sm">
              <FileText className="h-4 w-4 mr-2" /> Umum
            </TabsTrigger>
            <TabsTrigger value="struktur" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-xs md:text-sm">
              <Users className="h-4 w-4 mr-2" /> Struktur
            </TabsTrigger>
            <TabsTrigger value="rab" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-xs md:text-sm">
              <IDR className="h-4 w-4 mr-2" /> RAB
            </TabsTrigger>
            <TabsTrigger value="ttd" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-xs md:text-sm">
              <FileCheck className="h-4 w-4 mr-2" /> Penutup
            </TabsTrigger>
          </TabsList>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-6 md:p-10">
              <TabsContent value="umum" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 ml-1">Nama Kop Surat</Label>
                    <Input value={data.namaKopSurat} onChange={(e) => setData({ ...data, namaKopSurat: e.target.value })} className="h-12 rounded-2xl border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 ml-1">Kontak Kop Surat</Label>
                    <Input value={data.kontakKopSurat} onChange={(e) => setData({ ...data, kontakKopSurat: e.target.value })} className="h-12 rounded-2xl border-slate-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 ml-1">Alamat Kop Surat</Label>
                  <Textarea value={data.alamatKopSurat} onChange={(e) => setData({ ...data, alamatKopSurat: e.target.value })} className="min-h-[80px] rounded-2xl border-slate-200" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 ml-1">Nomor Surat</Label>
                    <Input className="h-12 rounded-2xl border-slate-200" value={data.nomor} onChange={(e) => setData({ ...data, nomor: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 ml-1">Lampiran</Label>
                    <Input className="h-12 rounded-2xl border-slate-200" value={data.lampiran} onChange={(e) => setData({ ...data, lampiran: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 ml-1">Perihal Proposal</Label>
                  <Input value={data.perihal} onChange={(e) => setData({ ...data, perihal: e.target.value })} className="h-12 rounded-2xl border-slate-200 font-bold text-emerald-600" />
                </div>
                
                <div className="p-8 bg-slate-50/50 rounded-4xl border border-slate-100 space-y-6">
                   <h3 className="font-black text-emerald-700 flex items-center text-lg uppercase tracking-wider">
                     <Users className="h-5 w-5 mr-3" /> Tujuan Penerima
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Nama Penerima</Label>
                      <Input className="h-12 rounded-xl bg-white border-slate-200" value={data.penerima.nama} onChange={(e) => handlePenerimaChange('nama', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Jabatan</Label>
                      <Input className="h-12 rounded-xl bg-white border-slate-200" value={data.penerima.jabatan} onChange={(e) => handlePenerimaChange('jabatan', e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Alamat Tujuan</Label>
                      <Input className="h-12 rounded-xl bg-white border-slate-200" value={data.penerima.alamat} onChange={(e) => handlePenerimaChange('alamat', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700 ml-1">Isi Surat Pengantar</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAiGenerate('cover-letter')}
                      disabled={isAiLoading === 'cover-letter'}
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold"
                    >
                      {isAiLoading === 'cover-letter' ? <RotateCcw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                      Saran AI
                    </Button>
                  </div>
                  <Textarea 
                    value={data.suratPengantar} 
                    onChange={(e) => setData({ ...data, suratPengantar: e.target.value })}
                    className="min-h-[200px] rounded-3xl border-slate-200 p-6 bg-slate-50/30"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700 ml-1">Narasi Latar Belakang</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAiGenerate('background')}
                      disabled={isAiLoading === 'background'}
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold"
                    >
                      {isAiLoading === 'background' ? <RotateCcw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                      Saran AI
                    </Button>
                  </div>
                  <Textarea 
                    value={data.latarBelakang} 
                    onChange={(e) => setData({ ...data, latarBelakang: e.target.value })}
                    className="min-h-[150px] rounded-3xl border-slate-200 p-6 bg-slate-50/30"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700 ml-1">Maksud dan Tujuan</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAiGenerate('objectives')}
                        disabled={isAiLoading === 'objectives'}
                        className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold"
                      >
                        {isAiLoading === 'objectives' ? <RotateCcw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                        Saran AI
                      </Button>
                      <Button variant="ghost" size="sm" onClick={addTujuan} className="rounded-xl text-emerald-600 hover:bg-emerald-50 font-bold h-8">
                          <Plus className="h-4 w-4 mr-1" /> Tambah Poin
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {data.tujuan.map((t, i) => (
                      <div key={i} className="flex gap-3">
                        <Input value={t} onChange={(e) => updateTujuan(i, e.target.value)} className="rounded-xl h-12 border-slate-200" />
                        <Button variant="ghost" size="icon" onClick={() => removeTujuan(i)} className="text-rose-500 rounded-xl">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="struktur" className="space-y-10 mt-0">
                 <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-l-4 border-emerald-500 pl-4">Pimpinan Utama</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.struktur.pimpinanAtas.map((p, i) => (
                        <div key={i} className="space-y-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                           <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{p.role}</Label>
                           <Input value={p.name} className="h-11 rounded-xl bg-white" onChange={(e) => updateStrukturName('pimpinanAtas', i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-l-4 border-emerald-500 pl-4">Administrasi & Keuangan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.struktur.administrasi.map((p, i) => (
                        <div key={i} className="space-y-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{p.role}</Label>
                            <Input value={p.name} className="h-11 rounded-xl bg-white" onChange={(e) => updateStrukturName('administrasi', i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-l-4 border-emerald-500 pl-4">Penandatangan Tambahan (Opsional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Ketua RW</Label>
                            <Input value={data.namaKetuaRW} className="h-11 rounded-xl bg-white" onChange={(e) => setData({...data, namaKetuaRW: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Ketua RT</Label>
                            <Input value={data.namaKetuaRT} className="h-11 rounded-xl bg-white" onChange={(e) => setData({...data, namaKetuaRT: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Ketua Pemuda</Label>
                            <Input value={data.namaKetuaPemuda} className="h-11 rounded-xl bg-white" onChange={(e) => setData({...data, namaKetuaPemuda: e.target.value})} />
                        </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="rab" className="space-y-8 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Rencana Anggaran Biaya</h3>
                  <Button onClick={addRab} className="bg-emerald-700 hover:bg-emerald-800 rounded-2xl px-6 h-12 shadow-lg shadow-emerald-100">
                    <Plus className="h-4 w-4 mr-2" /> Tambah Item
                  </Button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/30">
                  {/* RAB Mobile View */}
                  <div className="md:hidden divide-y divide-slate-100 bg-white">
                    {data.rab.map((item, i) => (
                      <div key={i} className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <Input value={item.nama} placeholder="Nama Barang" onChange={(e) => updateRab(i, 'nama', e.target.value)} className="h-10 px-3 text-sm font-bold border-slate-100 bg-slate-50 w-full mr-2" />
                          <Button variant="ghost" size="icon" onClick={() => removeRab(i)} className="text-rose-400 shrink-0 h-10 w-10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input value={item.spesifikasi} placeholder="Spesifikasi" onChange={(e) => updateRab(i, 'spesifikasi', e.target.value)} className="h-8 px-3 text-[10px] border-slate-50 bg-slate-50/50" />
                        
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Jumlah</Label>
                            <Input type="number" value={item.jumlah} onChange={(e) => updateRab(i, 'jumlah', parseInt(e.target.value))} className="h-9" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-slate-400">Harga</Label>
                            <Input type="number" value={item.hargaSatuan} onChange={(e) => updateRab(i, 'hargaSatuan', parseInt(e.target.value))} className="h-9" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                          <span className="text-[9px] uppercase font-black text-slate-400">Subtotal</span>
                          <span className="font-bold text-emerald-600 text-sm">Rp {(item.totalHarga).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                    {data.rab.length > 0 && (
                      <div className="p-6 bg-emerald-50 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900 mb-1">Total Biaya</p>
                        <p className="text-2xl font-black text-emerald-700">Rp {calculateTotalRab().toLocaleString('id-ID')}</p>
                      </div>
                    )}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-emerald-900 text-white font-bold text-[10px] uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-5 text-center">Item & Spesifikasi</th>
                          <th className="px-4 py-5 w-24 text-center">Jumlah</th>
                          <th className="px-6 py-5 w-40 text-center">Harga Satuan</th>
                          <th className="px-6 py-5 w-48 text-center">Total</th>
                          <th className="px-4 py-5 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {data.rab.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4">
                              <Input value={item.nama} placeholder="Nama Barang" onChange={(e) => updateRab(i, 'nama', e.target.value)} className="h-10 text-sm font-bold border-none bg-slate-50 mb-1" />
                              <Input value={item.spesifikasi} placeholder="Spesifikasi" onChange={(e) => updateRab(i, 'spesifikasi', e.target.value)} className="h-8 text-xs border-none bg-transparent" />
                            </td>
                            <td className="px-4 py-4">
                              <Input type="number" value={item.jumlah} onChange={(e) => updateRab(i, 'jumlah', parseInt(e.target.value))} className="h-10 text-center" />
                            </td>
                            <td className="px-6 py-4">
                              <Input type="number" value={item.hargaSatuan} onChange={(e) => updateRab(i, 'hargaSatuan', parseInt(e.target.value))} className="h-10" />
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                              Rp {(item.totalHarga).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-4">
                              <Button variant="ghost" size="icon" onClick={() => removeRab(i)} className="text-rose-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                          <tr className="bg-emerald-50">
                              <td colSpan={3} className="px-6 py-6 text-right font-black uppercase tracking-widest text-xs text-emerald-900">Total Biaya</td>
                              <td colSpan={2} className="px-6 py-6 text-2xl font-black text-emerald-700">Rp {calculateTotalRab().toLocaleString('id-ID')}</td>
                          </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ttd" className="space-y-8 mt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700">Kalimat Penutup</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAiGenerate('closing')}
                      disabled={isAiLoading === 'closing'}
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold"
                    >
                      {isAiLoading === 'closing' ? <RotateCcw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
                      Saran AI
                    </Button>
                  </div>
                  <Textarea value={data.penutup} onChange={(e) => setData({...data, penutup: e.target.value})} className="min-h-[150px] rounded-3xl" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Tempat Penerbitan</Label>
                        <Input value={data.tempat} onChange={(e) => setData({...data, tempat: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Tanggal Surat</Label>
                        <Input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                </div>
              </TabsContent>
            </CardContent>
            
            <div className="p-10 bg-slate-50 border-t">
               <Button 
                className="w-full h-16 rounded-3xl font-black bg-emerald-800 hover:bg-emerald-900 shadow-xl shadow-emerald-100 text-white text-lg"
                onClick={handleSave}
                disabled={isSaving}
               >
                 {isSaving ? 'Memproses...' : 'Simpan & Ajukan Proposal'}
               </Button>
            </div>
          </Card>
        </Tabs>
      </div>
      )}

      {/* PREVIEW SECTION */}
      <div className={isViewMode ? "fixed inset-0 overflow-y-auto flex justify-center py-10 px-4 bg-slate-100 z-50" : "w-full lg:w-[650px] shrink-0"}>
        <div className="w-full max-w-[850px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-2xl text-slate-900 uppercase tracking-tight">Kajian Visual</h2>
            <div className="flex gap-2">
                {isViewMode && (
                    <Button variant="outline" className="rounded-xl border-slate-300 font-bold" onClick={() => router.push('/admin/persuratan')}>Tutup</Button>
                )}
                <Button onClick={generatePDF} disabled={isGeneratingPDF} className="rounded-xl font-bold bg-slate-900">
                    <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Mencetak...' : 'Unduh PDF'}
                </Button>
            </div>
          </div>

          <div className="bg-slate-200 p-8 rounded-[3.5rem] shadow-inner h-[calc(100vh-160px)] overflow-y-auto space-y-12 flex flex-col items-center">
              <div ref={previewRef} className="flex flex-col gap-8 scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] origin-top">
                <Page1 data={data} />
                <Page2 data={data} />
                <Page3 data={data} />
                <Page4 data={data} />
                <Page5 data={data} />
              </div>
          </div>
        </div>
      </div>
    </div>
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .proposal-page {
            font-family: 'Crimson Pro', serif !important;
            background: white !important;
            color: black !important;
            line-height: 1.5;
        }
        .kop-line { border-bottom: 3px solid black; margin-bottom: 2px; }
        .kop-line-thin { border-bottom: 1px solid black; }
    `}</style>
    </AdminLayout>
  )
}

function PageWrapper({ children, data }: { children: React.ReactNode, data: ProposalData }) {
    return (
       <div className="proposal-page relative flex flex-col" 
            style={{ 
              width: '794px', 
              height: '1123px', 
              padding: '60px 80px', 
              boxSizing: 'border-box',
              boxShadow: '0 0 40px rgba(0,0,0,0.1)',
              margin: '0 auto'
            }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <img src={data.logoKiri || "/logo.png"} style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                <h1 style={{ fontWeight: 'bold', fontSize: '15pt', margin: '0', textTransform: 'uppercase' }}>{data.namaKopSurat}</h1>
                <p style={{ fontSize: '10pt', margin: '5px 0', whiteSpace: 'pre-line' }}>{data.alamatKopSurat}</p>
                <p style={{ fontSize: '9pt', margin: '0', fontStyle: 'italic' }}>{data.kontakKopSurat}</p>
            </div>
            {data.logoKanan ? (
                <img src={data.logoKanan} style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
            ) : <div style={{ width: '85px' }} />}
        </div>
        
        <div className="kop-line"></div>
        <div className="kop-line-thin"></div>

        <div style={{ flex: 1, marginTop: '30px' }}>
          {children}
        </div>
      </div>
    )
}

function Page1({ data }: { data: ProposalData }) {
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <table style={{ width: '100%', marginBottom: '30px' }}>
                    <tbody>
                        <tr><td style={{ width: '100px' }}>Nomor</td><td style={{ width: '20px' }}>:</td><td style={{ fontWeight: 'bold' }}>{data.nomor || '___/___/___/___'}</td></tr>
                        <tr><td>Lampiran</td><td>:</td><td>{data.lampiran}</td></tr>
                        <tr><td>Perihal</td><td>:</td><td><span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.perihal}</span></td></tr>
                    </tbody>
                </table>

                <p>Kepada Yth.</p>
                <p style={{ fontWeight: 'bold', fontSize: '13pt', margin: '5px 0' }}>{data.penerima.nama || '........................'}</p>
                {data.penerima.jabatan && <p style={{ fontWeight: 'bold' }}>({data.penerima.jabatan})</p>}
                <p style={{ marginTop: '10px' }}>di -</p>
                <p style={{ paddingLeft: '30px', fontWeight: 'bold' }}>{data.penerima.alamat || 'Tempat'}</p>

                <div style={{ marginTop: '40px', textAlign: 'justify' }}>
                    {data.suratPengantar.split('\n').map((line, i) => (
                        <p key={i} style={{ textIndent: line.length > 50 ? '40px' : '0', marginBottom: '15px' }}>{line}</p>
                    ))}
                </div>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p>{data.tempat}, {data.tanggal}</p>
                        <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Mengetahui,</p>
                        <p style={{ fontWeight: 'bold' }}>Ketua DKM Al-Muhajirin</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>{data.namaKetua || '( ........................ )'}</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

function Page2({ data }: { data: ProposalData }) {
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', borderLeft: '10px solid black', paddingLeft: '20px', marginBottom: '30px', textTransform: 'uppercase' }}>I. Pendahuluan</h2>
                
                <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>A. Latar Belakang</h3>
                <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '30px' }}>{data.latarBelakang}</div>

                <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>B. Maksud dan Tujuan</h3>
                <ul style={{ paddingLeft: '30px' }}>
                    {data.tujuan.map((t, i) => (
                        <li key={i} style={{ marginBottom: '10px' }}>{t}</li>
                    ))}
                </ul>
            </div>
        </PageWrapper>
    )
}

function Page3({ data }: { data: ProposalData }) {
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', borderLeft: '10px solid black', paddingLeft: '20px', marginBottom: '30px', textTransform: 'uppercase' }}>II. Struktur Organisasi</h2>
                
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11pt', borderBottom: '1px solid black', paddingBottom: '5px', marginBottom: '15px' }}>Pimpinan Utama</h3>
                    {data.struktur.pimpinanAtas.map((p, i) => (
                        <p key={i} style={{ paddingLeft: '20px', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', display: 'inline-block', width: '180px' }}>{p.role}</span> : {p.name || '........................'}
                        </p>
                    ))}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11pt', borderBottom: '1px solid black', paddingBottom: '5px', marginBottom: '15px' }}>Administrasi & Keuangan</h3>
                    {data.struktur.administrasi.map((p, i) => (
                        <p key={i} style={{ paddingLeft: '20px', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', display: 'inline-block', width: '180px' }}>{p.role}</span> : {p.name || '........................'}
                        </p>
                    ))}
                </div>
            </div>
        </PageWrapper>
    )
}

function Page4({ data }: { data: ProposalData }) {
    const total = data.rab.reduce((sum, it) => sum + (it.totalHarga || 0), 0)
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', borderLeft: '10px solid black', paddingLeft: '20px', marginBottom: '30px', textTransform: 'uppercase' }}>III. Rencana Anggaran Biaya</h2>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid black', padding: '10px' }}>Item</th>
                            <th style={{ border: '1px solid black', padding: '10px', width: '80px' }}>Qty</th>
                            <th style={{ border: '1px solid black', padding: '10px' }}>Harga</th>
                            <th style={{ border: '1px solid black', padding: '10px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rab.map((item, i) => (
                            <tr key={i}>
                                <td style={{ border: '1px solid black', padding: '10px' }}>
                                    <p style={{ fontWeight: 'bold' }}>{item.nama}</p>
                                    <p style={{ fontSize: '10pt', color: '#666' }}>{item.spesifikasi}</p>
                                </td>
                                <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center' }}>{item.jumlah} {item.satuan}</td>
                                <td style={{ border: '1px solid black', padding: '10px', textAlign: 'right' }}>{item.hargaSatuan.toLocaleString('id-ID')}</td>
                                <td style={{ border: '1px solid black', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{item.totalHarga.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                            <td colSpan={3} style={{ border: '1px solid black', padding: '15px', textAlign: 'center', textTransform: 'uppercase' }}>Total Estimasi</td>
                            <td style={{ border: '1px solid black', padding: '15px', textAlign: 'right', fontSize: '14pt' }}>Rp {total.toLocaleString('id-ID')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </PageWrapper>
    )
}

function Page5({ data }: { data: ProposalData }) {
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', borderLeft: '10px solid black', paddingLeft: '20px', marginBottom: '30px', textTransform: 'uppercase' }}>IV. Penutup</h2>
                <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '50px' }}>{data.penutup}</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', textAlign: 'center' }}>
                    <div>
                        <p>Sekretaris DKM</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaSekretaris}</p>
                    </div>
                    <div>
                        <p>Ketua DKM</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaKetua}</p>
                    </div>
                    <div>
                        <p>Bendahara DKM</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaBendahara}</p>
                    </div>
                    <div>
                        <p>Tokoh Masyarakat</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{data.namaTokohMasyarakat}</p>
                    </div>
                </div>

                <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center', opacity: data.namaKetuaRW || data.namaKetuaRT || data.namaKetuaPemuda ? 1 : 0.3 }}>
                    <div>
                        <p style={{ fontSize: '10pt' }}>Ketua RW 008</p>
                        <div style={{ height: '60px' }}></div>
                        <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>{data.namaKetuaRW || '( ........................ )'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '10pt' }}>Ketua RT 015</p>
                        <div style={{ height: '60px' }}></div>
                        <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>{data.namaKetuaRT || '( ........................ )'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '10pt' }}>Ketua Pemuda</p>
                        <div style={{ height: '60px' }}></div>
                        <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>{data.namaKetuaPemuda || '( ........................ )'}</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default function ProposalBuilderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Memuat asisten proposal...</div>}>
            <ProposalBuilderContent />
        </Suspense>
    )
}
