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
  namaKetuaRISMA: string
  namaKepalaDesa: string
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
      { role: 'Tokoh Masyarakat', name: '' },
      { role: 'Ketua DKM', name: '' },
      { role: 'Ketua RW', name: '' },
      { role: 'Ketua RT', name: '' },
      { role: 'Ketua Pemuda', name: '' },
      { role: 'Ketua RISMA', name: '' }
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
  namaKetuaRISMA: '',
  namaKepalaDesa: '',
  logoKiri: "/logo.png",
  logoKanan: "",
  lampiranFoto: [],
  waktuKegiatan: '',
  tempatKegiatan: '',
  showWaktuTempat: false
}

const getRomanMonth = (month: number): string => {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return roman[month - 1] || ''
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
  const [history, setHistory] = useState<ProposalData | null>(null)
  const [bulkRecipients, setBulkRecipients] = useState<{ nama: string, jabatan: string, alamat: string }[]>([])
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)
  const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0)
  const [bulkProgress, setBulkProgress] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  const generateAutoNomor = async () => {
    try {
      const res = await fetch('/api/admin/persuratan')
      const list = await res.json()
      const proposalCount = Array.isArray(list) ? list.filter((i: any) => i.type === 'PROPOSAL').length : 0
      const nextNumber = (proposalCount + 1).toString().padStart(3, '0')
      const month = getRomanMonth(new Date().getMonth() + 1)
      const year = new Date().getFullYear()
      return `${nextNumber}/PRP-ALM/${month}/${year}`
    } catch (error) {
      console.error('Failed to generate automatic document number', error)
      return ''
    }
  }

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
      // Auto generate nomor for new proposal
      const initNewProposal = async () => {
        setIsLoadingInitialData(true)
        const autoNomor = await generateAutoNomor()
        setData({ ...initialData, nomor: autoNomor })
        setIsLoadingInitialData(false)
      }
      
      initNewProposal()
      setBulkRecipients([])
      setProposalStatus('pending')
      setRejectionReason('')
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
    setHistory({...data})
    setIsAiLoading(type)
    
    try {
      const prompts: Record<string, string> = {
        background: `Buatkan narasi latar belakang untuk proposal kegiatan DKM (Dewan Kemakmuran Masjid) Al-Muhajirin dengan perihal: "${data.perihal}". 
        
Konteks:
- Lokasi: Kampung Ragas Grenyang, Desa Argawana, Kecamatan Puloampel, Kabupaten Serang, Banten
- Organisasi: DKM Al-Muhajirin Ragas Grenyang
- Masjid sebagai pusat kegiatan keagamaan dan sosial masyarakat

Buatkan latar belakang yang:
1. Formal dan profesional
2. Menjelaskan urgensi kegiatan/program
3. Mengaitkan dengan kondisi jamaah dan masyarakat
4. Panjang 2-3 paragraf (150-200 kata)
5. Bahasa Indonesia yang baik dan benar

Hanya berikan teks latar belakang saja, tanpa judul atau penjelasan tambahan.`,

        'cover-letter': `Buatkan surat pengantar untuk proposal kegiatan DKM Al-Muhajirin dengan perihal: "${data.perihal}".

Buatkan surat pengantar yang:
1. Diawali dengan salam "Assalamu'alaikum Wr. Wb."
2. Menyampaikan maksud pengajuan proposal
3. Formal dan sopan
4. Menggunakan bahasa Indonesia yang baik
5. Panjang 2-3 paragraf

Hanya berikan teks surat pengantar saja.`,

        closing: `Buatkan kalimat penutup untuk proposal kegiatan DKM Al-Muhajirin dengan perihal: "${data.perihal}".

Buatkan penutup yang:
1. Mengucapkan terima kasih
2. Menyampaikan harapan dukungan
3. Doa untuk penerima proposal
4. Formal dan profesional
5. Panjang 1-2 paragraf

Hanya berikan teks penutup saja.`,

        objectives: `Buatkan 4-5 poin maksud dan tujuan untuk proposal kegiatan DKM Al-Muhajirin dengan perihal: "${data.perihal}".

Konteks:
- Organisasi: DKM Al-Muhajirin Ragas Grenyang
- Lokasi: Kampung Ragas Grenyang, Serang, Banten

Buatkan tujuan yang:
1. Spesifik dan terukur
2. Relevan dengan kegiatan masjid/DKM
3. Bermanfaat untuk jamaah dan masyarakat
4. Setiap poin maksimal 15 kata

Format: Berikan dalam bentuk array JSON dengan key "tujuan", contoh:
{"tujuan": ["Tujuan 1", "Tujuan 2", "Tujuan 3"]}

Hanya berikan JSON saja, tanpa penjelasan.`
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompts[type],
          context: {
            perihal: data.perihal,
            type: type
          }
        })
      })

      if (!response.ok) {
        throw new Error('AI generation failed')
      }

      const result = await response.json()
      
      if (type === 'objectives') {
        try {
          const parsed = JSON.parse(result.text)
          setData(prev => ({ ...prev, tujuan: parsed.tujuan }))
        } catch {
          // Fallback if JSON parsing fails
          const lines = result.text.split('\n').filter((l: string) => l.trim().length > 0)
          setData(prev => ({ ...prev, tujuan: lines }))
        }
      } else if (type === 'background') {
        setData(prev => ({ ...prev, latarBelakang: result.text }))
      } else if (type === 'cover-letter') {
        setData(prev => ({ ...prev, suratPengantar: result.text }))
      } else if (type === 'closing') {
        setData(prev => ({ ...prev, penutup: result.text }))
      }

      toast.success('Saran AI berhasil diterapkan! (Gunakan Undo untuk membatalkan)')
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Gagal menghasilkan saran AI. Silakan coba lagi.')
    } finally {
      setIsAiLoading(null)
    }
  }

  const handleUndo = () => {
      if (history) {
        setData(history)
        setHistory(null)
        toast.success('Berhasil kembali ke perubahan sebelumnya')
      } else {
        toast.error('Tidak ada riwayat perubahan untuk dikembalikan')
      }
  }

  const handleReset = async () => {
      if (confirm('Apakah Anda yakin ingin menghapus semua inputan dan kembali ke awal?')) {
          const autoNomor = await generateAutoNomor()
          setData({ ...initialData, nomor: autoNomor })
          setBulkRecipients([])
          setCurrentRecipientIndex(0)
          toast.success('Formulir berhasil direset dengan nomor baru')
      }
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
    
    try {
      if (bulkRecipients.length > 0) {
        setIsBulkProcessing(true)
        setBulkProgress(0)
        toast.info(`Menyiapkan ${bulkRecipients.length} PDF...`)
        const zip = new JSZip()
        
        for (let i = 0; i < bulkRecipients.length; i++) {
          setCurrentRecipientIndex(i)
          setBulkProgress(Math.round(((i + 1) / bulkRecipients.length) * 100))
          
          // Wait for DOM to update
          await new Promise(resolve => setTimeout(resolve, 600))
          
          const doc = new jsPDF('p', 'mm', 'a4')
          const pages = previewRef.current.querySelectorAll('.proposal-page')
          
          for (let j = 0; j < pages.length; j++) {
            const page = pages[j] as HTMLElement
            const canvas = await html2canvas(page, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: 794,
              windowHeight: 1123,
            })
            const imgData = canvas.toDataURL('image/jpeg', 0.9)
            if (j > 0) doc.addPage()
            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
          }
          
          const pdfBlob = doc.output('blob')
          const fileName = `Proposal_${bulkRecipients[i].nama.replace(/\s+/g, '_')}.pdf`
          zip.file(fileName, pdfBlob)
        }
        
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `Batch_Proposal_${data.perihal.replace(/\s+/g, '_')}.zip`
        link.download = `Batch_Proposal_${data.perihal.replace(/\s+/g, '_')}.zip`
        link.click()
        setIsBulkProcessing(false)
        toast.success('Batch PDF (ZIP) berhasil diunduh')
      } else {
        toast.info('Menyiapkan PDF...')
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
      }
    } catch (error) {
      console.error(error)
      toast.error('Gagal membuat PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <AdminLayout title="Proposal Builder" subtitle="Buat proposal premium DKM Al-Muhajirin">
    <div className={isViewMode ? "" : "flex flex-col lg:flex-row gap-10 pb-20 mt-6 max-w-[2000px] mx-auto px-4 md:px-8 xl:px-12"}>
      {!isViewMode && (
      <div className="flex-1 min-w-0 space-y-6">
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
        
        {/* ... (existing Tabs and Card content remains same) ... */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto md:h-16 w-full bg-slate-100 p-1.5 rounded-3xl mb-6 gap-1 md:gap-0">
            <TabsTrigger value="umum" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-[10px] md:text-sm">
              <FileText className="h-4 w-4 mr-2" /> Umum
            </TabsTrigger>
            <TabsTrigger value="struktur" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-[10px] md:text-sm">
              <Users className="h-4 w-4 mr-2" /> Struktur
            </TabsTrigger>
            <TabsTrigger value="rab" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-[10px] md:text-sm">
              <IDR className="h-4 w-4 mr-2" /> RAB
            </TabsTrigger>
            <TabsTrigger value="foto" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-[10px] md:text-sm">
              <ImageIcon className="h-4 w-4 mr-2" /> Foto
            </TabsTrigger>
            <TabsTrigger value="ttd" className="rounded-2xl font-bold py-3 md:py-0 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm transition-all text-[10px] md:text-sm">
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
                   <div className="flex items-center justify-between">
                    <h3 className="font-black text-emerald-700 flex items-center text-lg uppercase tracking-wider">
                      <Users className="h-5 w-5 mr-3" /> Tujuan Penerima
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-wrap">
                        <a href="/template_penerima_proposal.xlsx" download className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                             <Download className="h-4 w-4 mr-1" /> Template
                        </a>
                        <Label htmlFor="excel-upload" className="cursor-pointer flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap">
                             <Upload className="h-4 w-4 mr-1" /> Upload Excel Penerima
                             <input id="excel-upload" type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                        </Label>
                        {bulkRecipients.length > 0 && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {bulkRecipients.length} Penerima Dimuat
                            </Badge>
                        )}
                    </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Nama Penerima</Label>
                      <Input 
                        disabled={bulkRecipients.length > 0} 
                        className="h-12 rounded-xl bg-white border-slate-200" 
                        value={bulkRecipients.length > 0 ? bulkRecipients[currentRecipientIndex].nama : data.penerima.nama} 
                        onChange={(e) => handlePenerimaChange('nama', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Jabatan</Label>
                      <Input 
                        disabled={bulkRecipients.length > 0} 
                        className="h-12 rounded-xl bg-white border-slate-200" 
                        value={bulkRecipients.length > 0 ? bulkRecipients[currentRecipientIndex].jabatan : data.penerima.jabatan} 
                        onChange={(e) => handlePenerimaChange('jabatan', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Alamat Tujuan</Label>
                      <Input 
                        disabled={bulkRecipients.length > 0} 
                        className="h-12 rounded-xl bg-white border-slate-200" 
                        value={bulkRecipients.length > 0 ? bulkRecipients[currentRecipientIndex].alamat : data.penerima.alamat} 
                        onChange={(e) => handlePenerimaChange('alamat', e.target.value)} 
                      />
                    </div>
                  </div>
                  {bulkRecipients.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400">Navigasi Preview Penerima:</p>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setCurrentRecipientIndex(prev => Math.max(0, prev - 1))} disabled={currentRecipientIndex === 0}>
                                  <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-xs font-bold self-center">{currentRecipientIndex + 1} / {bulkRecipients.length}</span>
                              <Button variant="ghost" size="sm" onClick={() => setCurrentRecipientIndex(prev => Math.min(bulkRecipients.length - 1, prev + 1))} disabled={currentRecipientIndex === bulkRecipients.length - 1}>
                                  <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => {setBulkRecipients([]); setCurrentRecipientIndex(0);}}>Reset Massal</Button>
                          </div>
                      </div>
                  )}
                </div>

                <div className="p-8 bg-slate-50/50 rounded-4xl border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-emerald-700 flex items-center text-lg uppercase tracking-wider">
                            <Calendar className="h-5 w-5 mr-3" /> Waktu & Tempat Kegiatan
                        </h3>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="show-waktu" className="text-xs font-bold text-slate-500">Tampilkan di Proposal</Label>
                            <input 
                                type="checkbox" 
                                id="show-waktu" 
                                checked={data.showWaktuTempat} 
                                onChange={(e) => setData({...data, showWaktuTempat: e.target.checked})}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    {data.showWaktuTempat && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Hari & Tanggal Kegiatan</Label>
                                <Input 
                                    placeholder="Contoh: Minggu, 24 Maret 2024"
                                    className="h-12 rounded-xl bg-white border-slate-200" 
                                    value={data.waktuKegiatan} 
                                    onChange={(e) => setData({...data, waktuKegiatan: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-1">Tempat Kegiatan</Label>
                                <Input 
                                    placeholder="Contoh: Halaman Masjid Al-Muhajirin"
                                    className="h-12 rounded-xl bg-white border-slate-200" 
                                    value={data.tempatKegiatan} 
                                    onChange={(e) => setData({...data, tempatKegiatan: e.target.value})} 
                                />
                            </div>
                        </div>
                    )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-800 border-l-4 border-emerald-500 pl-4">Seksi Operasional / Kepanitiaan</h3>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setData(prev => ({...prev, struktur: {...prev.struktur, operasional: [...prev.struktur.operasional, '']}}))}
                            className="text-emerald-600 font-bold"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Tambah Seksi
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.struktur.operasional.map((op, i) => (
                              <div key={i} className="flex gap-2">
                                  <Input 
                                    placeholder="Contoh: Seksi Konsumsi: Bpk. Fulan" 
                                    value={op} 
                                    onChange={(e) => {
                                        const newOp = [...data.struktur.operasional]
                                        newOp[i] = e.target.value
                                        setData(prev => ({...prev, struktur: {...prev.struktur, operasional: newOp}}))
                                    }} 
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200" 
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setData(prev => ({...prev, struktur: {...prev.struktur, operasional: prev.struktur.operasional.filter((_, idx) => idx !== i)}}))}
                                    className="text-rose-400"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ))}
                          {data.struktur.operasional.length === 0 && (
                              <p className="text-slate-400 text-sm italic col-span-2">Belum ada seksi operasional ditambahkan.</p>
                          )}
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
                 
                 <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100 space-y-4">
                   <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Tanda Tangan Pemerintah Setempat (Opsional)</h4>
                   <div className="space-y-2">
                     <Label className="font-bold text-slate-700">Kepala Desa Argawana</Label>
                     <Input 
                       value={data.namaKepalaDesa} 
                       onChange={(e) => setData({...data, namaKepalaDesa: e.target.value})} 
                       className="h-12 rounded-xl bg-white" 
                       placeholder="Kosongkan jika tidak diperlukan"
                     />
                     <p className="text-xs text-slate-500 italic">* Jika diisi, tanda tangan Kepala Desa akan muncul di bagian Mengetahui</p>
                   </div>
                 </div>
               </TabsContent>

               <TabsContent value="foto" className="space-y-8 mt-0">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Lampiran Dokumen/Foto</h3>
                        <Button onClick={addLampiranFoto} className="bg-emerald-700 hover:bg-emerald-800 rounded-2xl px-6 h-12 shadow-lg shadow-emerald-100">
                            <Plus className="h-4 w-4 mr-2" /> Tambah Foto
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.lampiranFoto.map((foto, i) => (
                            <Card key={i} className="overflow-hidden border-slate-100 rounded-3xl shadow-sm">
                                <div className="aspect-video bg-slate-100 relative group">
                                    {foto.url ? (
                                        <img src={foto.url} alt="Lampiran" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                                            <p className="text-xs font-bold">Belum ada foto</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Label htmlFor={`foto-upload-${i}`} className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center">
                                            <Upload className="h-3 w-3 mr-2" /> Ganti Foto
                                            <input 
                                                id={`foto-upload-${i}`} 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleLampiranFotoUpload(i, e)} 
                                            />
                                        </Label>
                                        <Button variant="destructive" size="icon" onClick={() => removeLampiranFoto(i)} className="rounded-xl">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <Input 
                                        placeholder="Tulis deskripsi atau keterangan foto..." 
                                        value={foto.deskripsi} 
                                        onChange={(e) => updateLampiranFoto(i, 'deskripsi', e.target.value)}
                                        className="border-none bg-slate-50 rounded-xl"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                    {data.lampiranFoto.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <ImageIcon className="h-20 w-20 mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">Belum ada lampiran foto ditambahkan</p>
                            <Button variant="ghost" className="mt-4 text-emerald-600 font-bold" onClick={addLampiranFoto}>Mulai Tambah Foto</Button>
                        </div>
                    )}
               </TabsContent>
            </CardContent>
            
             <div className="p-10 bg-slate-50 border-t flex flex-col md:flex-row gap-4">
               <Button 
                variant="outline"
                className="flex-1 md:flex-none h-16 rounded-3xl font-black border-slate-200 text-slate-500 hover:bg-slate-100 px-8"
                onClick={handleReset}
               >
                 <RotateCcw className="h-5 w-5 mr-2" /> Reset
               </Button>
               {history && (
                   <Button 
                    variant="outline"
                    className="flex-1 md:flex-none h-16 rounded-3xl font-black border-emerald-100 text-emerald-600 hover:bg-emerald-50 px-8"
                    onClick={handleUndo}
                   >
                     Urungkan Ganti AI
                   </Button>
               )}
               <Button 
                className="flex-1 h-16 rounded-3xl font-black bg-emerald-800 hover:bg-emerald-900 shadow-xl shadow-emerald-100 text-white text-lg"
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
      <div className={isViewMode ? "fixed inset-0 overflow-y-auto flex justify-center py-12 px-6 bg-slate-100/80 backdrop-blur-md z-50 animate-in fade-in duration-500" : "w-full lg:w-[450px] xl:w-[550px] 2xl:w-[650px] shrink-0 sticky top-6 h-fit max-h-[calc(100vh-48px)] transition-all duration-500"}>
        <div className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="font-bold text-lg text-slate-800 uppercase tracking-tight flex items-center gap-2">
                Preview <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[9px] px-2 py-0.5 rounded-full">PRO</Badge>
              </h2>
            </div>
            <div className="flex gap-2">
                {isViewMode && (
                    <Button variant="outline" className="rounded-xl border-slate-300 font-bold" onClick={() => router.push('/admin/persuratan')}>Tutup</Button>
                )}
                <Button onClick={generatePDF} disabled={isGeneratingPDF} className="rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-200 hover:scale-105 transition-transform active:scale-95">
                    <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Mencetak...' : 'Unduh PDF'}
                </Button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-[3rem] shadow-xl shadow-slate-200/30 overflow-y-auto space-y-12 flex flex-col items-center custom-scrollbar scroll-smooth" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <div ref={previewRef} className="flex flex-col gap-10 scale-[0.4] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.6] xl:scale-[0.75] 2xl:scale-[1.0] origin-top transition-all duration-500">
                <PageCover data={data} />
                <Page1 data={data} bulkRecipient={bulkRecipients.length > 0 ? bulkRecipients[currentRecipientIndex] : null} />
                <Page2 data={data} />
                <Page3 data={data} />
                <Page4 data={data} />
                <Page5 data={data} />
                {data.lampiranFoto.length > 0 && <Page6 data={data} />}
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `}</style>
    <Dialog open={isBulkProcessing} onOpenChange={setIsBulkProcessing}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader className="space-y-4">
                <DialogTitle className="text-2xl font-black text-center text-slate-900">Memproses Proposal Massal</DialogTitle>
                <DialogDescription className="text-center font-medium text-slate-500 italic">
                    Harap tunggu, asisten digital sedang menyiapkan {bulkRecipients.length} dokumen PDF Anda.
                </DialogDescription>
            </DialogHeader>
            <div className="py-8 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest animate-pulse">Progress: {bulkProgress}%</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentRecipientIndex + 1} / {bulkRecipients.length}</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div 
                        className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out shadow-lg shadow-emerald-100" 
                        style={{ width: `${bulkProgress}%` }}
                    />
                </div>
                <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Sekarang Memproses:</p>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                        {bulkRecipients[currentRecipientIndex]?.nama}
                    </Badge>
                </div>
            </div>
            <div className="flex justify-center">
                <RotateCcw className="h-6 w-6 text-emerald-600 animate-spin" />
            </div>
        </DialogContent>
    </Dialog>
    </AdminLayout>
  )
}

function PageCover({ data }: { data: ProposalData }) {
    return (
        <div className="proposal-page relative flex flex-col items-center justify-center" 
             style={{ 
               width: '794px', 
               height: '1123px', 
               padding: '100px 80px', 
               boxSizing: 'border-box',
               boxShadow: '0 0 40px rgba(0,0,0,0.1)',
               margin: '0 auto',
               background: 'linear-gradient(to bottom, #ffffff, #fcfdfc) !important'
             }}>
            
            {/* Header Style Elements */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, #f0fdf4 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '350px', height: '350px', background: 'radial-gradient(circle, #ecfdf5 0%, transparent 70%)', zIndex: 0, opacity: 0.6 }}></div>
            
            <div style={{ zIndex: 1, textAlign: 'center', width: '100%', position: 'relative' }}>
                <img src={data.logoKiri || "/logo.png"} style={{ width: '160px', height: '160px', objectFit: 'contain', margin: '0 auto 60px auto', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))' }} />
                
                <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 70px 0', color: '#475569', letterSpacing: '0.2em' }}>PROPOSAL</h1>
                
                <h2 style={{ fontWeight: '900', fontSize: '30pt', margin: '0 0 15px 0', textTransform: 'uppercase', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{data.perihal}</h2>
                <div style={{ width: '150px', height: '6px', background: 'linear-gradient(to right, #059669, #10b981)', margin: '35px auto' }}></div>
                
                <div style={{ margin: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(248, 250, 252, 0.5)', padding: '50px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '12pt', margin: '0', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diajukan Oleh:</p>
                    <p style={{ fontSize: '18pt', fontWeight: '900', margin: '15px 0', textTransform: 'uppercase', color: '#064e3b' }}>{data.namaKopSurat}</p>
                    <div style={{ height: '2px', width: '300px', backgroundColor: '#e2e8f0', margin: '25px 0' }}></div>
                    <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#475569', fontWeight: '500' }}>Kampung Ragas Grenyang, Desa Argawana</p>
                    <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#475569', fontWeight: '500' }}>Kecamatan Puloampel Kabupaten Serang - Banten</p>
                </div>

                <div style={{ position: 'absolute', bottom: '-100px', left: 0, width: '100%', textAlign: 'center' }}>
                    <p style={{ fontSize: '14pt', fontWeight: '900', letterSpacing: '8px', color: '#1e293b' }}>TAHUN {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
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

function Page1({ data, bulkRecipient }: { data: ProposalData, bulkRecipient?: any }) {
    const recipient = bulkRecipient || data.penerima
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
                <p style={{ fontWeight: 'bold', fontSize: '13pt', margin: '5px 0' }}>{recipient.nama || '........................'}</p>
                {recipient.jabatan && <p style={{ fontWeight: 'bold' }}>({recipient.jabatan})</p>}
                {recipient.instansi && <p style={{ fontWeight: 'bold' }}>{recipient.instansi}</p>}
                <p style={{ marginTop: '10px' }}>di -</p>
                <p style={{ paddingLeft: '30px', fontWeight: 'bold' }}>{recipient.alamat || 'Tempat'}</p>

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
                
                <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '13pt' }}>A. Latar Belakang</h3>
                <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '30px' }}>{data.latarBelakang}</div>

                <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '13pt' }}>B. Maksud dan Tujuan</h3>
                <ul style={{ paddingLeft: '30px', marginBottom: '30px' }}>
                    {data.tujuan.map((t, i) => (
                        <li key={i} style={{ marginBottom: '10px' }}>{t}</li>
                    ))}
                </ul>

                {data.showWaktuTempat && (
                    <>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '13pt' }}>C. Waktu dan Tempat Pelaksanaan</h3>
                        <div style={{ paddingLeft: '20px' }}>
                            <p style={{ marginBottom: '10px' }}>Kegiatan ini Insha Allah akan dilaksanakan pada:</p>
                            <table style={{ width: '100%', marginBottom: '20px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '150px', fontWeight: 'bold' }}>Hari / Tanggal</td>
                                        <td style={{ width: '20px' }}>:</td>
                                        <td>{data.waktuKegiatan || '........................'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Tempat</td>
                                        <td>:</td>
                                        <td>{data.tempatKegiatan || '........................'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
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

                {data.struktur.operasional.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11pt', borderBottom: '1px solid black', paddingBottom: '5px', marginBottom: '15px' }}>Seksi Operasional</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingLeft: '20px' }}>
                            {data.struktur.operasional.map((op, i) => (
                                <p key={i} style={{ margin: '0' }}>• {op}</p>
                            ))}
                        </div>
                    </div>
                )}
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

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ fontStyle: 'italic' }}>Argawana, {data.tanggal}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', textAlign: 'center', marginBottom: '50px' }}>
                    <div>
                        <p>Sekretaris DKM,</p>
                        <div style={{ height: '100px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>{data.namaSekretaris || '( ........................ )'}</p>
                    </div>
                    <div>
                        <p>Ketua DKM,</p>
                        <div style={{ height: '100px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>{data.namaKetua || '( ........................ )'}</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14pt' }}>Mengetahui</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', textAlign: 'center' }}>
                    <div style={{ opacity: data.namaKetuaRT ? 1 : 0.3 }}>
                        <p style={{ fontSize: '11pt' }}>Ketua RT 015,</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{data.namaKetuaRT || '( ........................ )'}</p>
                    </div>
                    <div style={{ opacity: data.namaKetuaRW ? 1 : 0.3 }}>
                        <p style={{ fontSize: '11pt' }}>Ketua RW 008,</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{data.namaKetuaRW || '( ........................ )'}</p>
                    </div>
                    <div style={{ opacity: data.namaKetuaPemuda ? 1 : 0.3 }}>
                        <p style={{ fontSize: '11pt' }}>Ketua Pemuda,</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{data.namaKetuaPemuda || '( ........................ )'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '11pt' }}>Tokoh Masyarakat,</p>
                        <div style={{ height: '80px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{data.namaTokohMasyarakat || '( ........................ )'}</p>
                    </div>
                    {data.namaKepalaDesa && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                            <p style={{ fontSize: '11pt' }}>Kepala Desa Argawana,</p>
                            <div style={{ height: '80px' }}></div>
                            <p style={{ fontSize: '11pt', fontWeight: 'bold' }}>{data.namaKepalaDesa}</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

function Page6({ data }: { data: ProposalData }) {
    return (
        <PageWrapper data={data}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: 'bold', borderLeft: '10px solid black', paddingLeft: '20px', marginBottom: '30px', textTransform: 'uppercase' }}>V. Lampiran Foto & Dokumentasi</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                    {data.lampiranFoto.map((foto, i) => (
                        <div key={i} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '10px', background: '#fafafa' }}>
                            <img src={foto.url} alt={`Lampiran ${i}`} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} />
                            <p style={{ textAlign: 'center', fontSize: '11pt', fontStyle: 'italic', fontWeight: 'bold' }}>{foto.deskripsi || `Dokumentasi ${i+1}`}</p>
                        </div>
                    ))}
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
