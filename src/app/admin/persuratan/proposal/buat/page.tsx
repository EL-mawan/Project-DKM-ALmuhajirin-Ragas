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
  ArrowLeft,
  ArrowRight,
  FileText, 
  Users, 
  FileCheck,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Calendar,
  Sparkles,
  AlertCircle,
  Wand2,
  Wallet
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminLayout } from '@/components/layout/admin-layout'
import { useSession } from 'next-auth/react'
import { 
  PageCover, 
  Page1, 
  Page2, 
  Page3, 
  Page4, 
  Page5, 
  Page6, 
  type ProposalData as SharedProposalData,
  type RABItem,
  type ProposalFoto
} from '@/components/persuratan/proposal-pdf-preview'

type ProposalData = SharedProposalData;

const IDR = ({ className }: { className?: string }) => (
  <div className={`${className} font-bold text-[10px] flex items-center justify-center`}>Rp</div>
)

// --- Types ---
// Types are imported from shared components


const initialData: ProposalData = {
  namaKopSurat: 'DEWAN KEMAKMURAN MASJID (DKM)\nAL-MUHAJIRIN KP. RAGAS GRENYANG',
  alamatKopSurat: 'Desa Argawana, Kecamatan Puloampel Kabupaten Serang\nProvinsi Banten 42455',
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
  suratPengantar: `Assalamu'alaikum Warahmatullahi Wabarakatuh,
  
  Puji syukur kita panjatkan ke hadirat Allah SWT. Semoga Bapak/Ibu senantiasa dalam lindungan-Nya.
  
  Sehubungan dengan rencana kegiatan DKM Al-Muhajirin, kami bermaksud mengajukan permohonan dukungan demi kelancaran acara tersebut. Partisipasi Bapak/Ibu sangat kami harapkan sebagai bentuk syiar Islam dan kemaslahatan bersama.
  
  Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
  Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  penutup: `Demikian proposal ini kami sampaikan dengan harapan besar agar Bapak/Ibu dapat membersamai langkah mulia ini. Kami percaya bahwa setiap kontribusi dan dukungan yang diberikan merupakan bentuk investasi akhirat yang tak terputus.

Atas segala dukungan, kerelaan, dan partisipasi yang Bapak/Ibu berikan, kami mendoakan semoga Allah SWT membalas dengan keberkahan rizki, kesehatan yang afiat, serta pahala yang melimpah. Segala bentuk amanah yang diberikan akan kami kelola dengan penuh tanggung jawab dan transparansi.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  latarBelakang: `Masjid Al-Muhajirin merupakan pusat kegiatan keagamaan, sosial, dan dakwah bagi jamaah serta warga di lingkungan Kampung Ragas Grenyang. Seiring dengan perkembangan zaman dan bertambahnya jumlah jamaah, tantangan dalam mengelola kegiataan dakwah serta menjaga fasilitas masjid pun semakin meningkat.

Dalam upaya menjaga semangat kebersamaan dan meningkatkan kualitas ibadah umat, DKM Al-Muhajirin terus berupaya menghadirkan program-program yang bermanfaat secara spiritual maupun sosial. Hal ini sejalan dengan visi kami untuk menjadikan masjid sebagai pusat peradaban umat yang makmur, amanah, dan membawa keberkahan bagi lingkungan industri Puloampel.

Oleh karena itu, kami memandang perlu untuk melaksanakan kegiatan ini sebagai bagian dari komitmen kami untuk terus melayani jamaah dan mengagungkan syiar Islam di tengah masyarakat.`,
  tujuan: [
    'Meningkatkan kualitas sarana dan prasarana ibadah bagi jamaah Masjid Al-Muhajirin.',
    'Mempererat tali silaturahmi dan ukhuwah islamiyah antar warga Ragas Grenyang.',
    'Mewujudkan lingkungan masjid yang nyaman, tertib, dan religius.',
    'Memberikan sarana edukasi keagamaan yang efektif bagi generasi muda.',
    'Menyiarkan syiar Islam secara inklusif kepada masyarakat luas.'
  ],
  struktur: {
    pimpinanAtas: [
      { role: 'Tokoh Masyarakat', name: '' },
      { role: 'Ketua DKM', name: '' },
      { role: 'Ketua RW 008', name: '' },
      { role: 'Ketua RT 015', name: '' },
      { role: 'Ketua Pemuda', name: '' }
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
  const [strukturOrganisasi, setStrukturOrganisasi] = useState<{ name: string, position: string }[]>([])

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

  // Fetch struktur organisasi
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
      const res = await fetch(`/api/admin/persuratan/${proposalId}`)
      if (!res.ok) throw new Error('Proposal not found')
      const item = await res.json()
      
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
      
      if (category === 'pimpinanAtas' && index === 0) updates.namaTokohMasyarakat = name
      if (category === 'pimpinanAtas' && index === 1) updates.namaKetua = name
      if (category === 'pimpinanAtas' && index === 2) updates.namaKetuaRW = name
      if (category === 'pimpinanAtas' && index === 3) updates.namaKetuaRT = name
      if (category === 'pimpinanAtas' && index === 4) updates.namaKetuaPemuda = name
      if (category === 'administrasi' && index === 0) updates.namaSekretaris = name
      if (category === 'administrasi' && index === 1) updates.namaBendahara = name
      
      return { ...prev, ...updates }
    })
  }

  const handleAiGenerate = async (type: 'background' | 'cover-letter' | 'closing' | 'objectives') => {
    console.log(`[AI] Starting generation for: ${type}`);
    
    if (!data.perihal || data.perihal.trim() === '') {
      toast.error('Harap isi perihal proposal terlebih dahulu sebagai konteks untuk AI.');
      setActiveTab('umum');
      return;
    }

    // Use functional update for history
    setHistory(prevHistory => ({...data}));
    setIsAiLoading(type);
    
    // Create a toast for the promise
    const promise = async () => {
      const prompts: Record<string, string> = {
        background: `Buatkan narasi Latar Belakang yang LUAR BIASA untuk proposal kegiatan DKM Al-Muhajirin.
Judul Kegiatan: "${data.perihal}"
Lokasi: Kampung Ragas Grenyang, Serang, Banten.

Persyaratan Narasi:
1. Sangat formal, inspiratif, dan menyentuh hati (Gunakan bahasa yang menggugah jiwa).
2. Terdiri dari minimal 3 paragraf yang kohesif.
3. Gunakan diksi yang elegan dan profesional (standar proposal nasional).

Hanya berikan teks narasinya saja. JANGAN berikan kalimat pembuka seperti "Ini adalah narasinya" atau judul apapun. Langsung ke paragraf pertama.`,

        'cover-letter': `Buatkan isi Surat Pengantar (bagian pokok) yang sangat santun dan profesional untuk proposal "${data.perihal}".

Instruksi:
1. Mulai dengan salam lengkap "Assalamu'alaikum Warahmatullahi Wabarakatuh,"
2. Gunakan gaya bahasa yang menunjukkan kerendahan hati namun tetap berwibawa sebagai pengurus DKM.
3. Jelaskan bahwa proposal ini adalah upaya untuk kebaikan bersama (syiar Islam).
4. Ajak kerjasama dengan cara yang sangat persuasif tanpa terkesan memaksa.
5. Terdiri dari 2-3 paragraf.

Hanya berikan isi surat narasinya saja. JANGAN berikan identitas pengirim/penerima atau judul.`,

        closing: `Buatkan Kalimat Penutup yang sangat kuat, penuh doa, dan terpercaya untuk proposal "${data.perihal}".

Instruksi:
1. Sampaikan rasa syukur dan harapan yang tulus.
2. Berikan doa yang mendalam bagi para donatur/pendukung.
3. Tekankan sifat amanah dan transparansi DKM Al-Muhajirin.
4. Gunakan penutup "Wassalamu'alaikum Warahmatullahi Wabarakatuh." sebagai akhir teks.

Hanya berikan teks penutupnya saja. JANGAN ada tambahan lain.`,

        objectives: `Berikan 5 poin "Maksud dan Tujuan" yang paling strategis dan visioner untuk proposal "${data.perihal}" DKM Al-Muhajirin.

Format: Berikan HANYA dalam format JSON murni: {"tujuan": ["Poin 1", "Poin 2", "Poin 3", "Poin 4", "Poin 5"]}.
Pastikan setiap poin dimulai dengan kata kerja (Contoh: Menjalin, Meningkatkan, Mewujudkan, dsb).`
      };

      console.log(`[AI] Dispatching fetch to /api/ai/suggest with type: ${type}`);
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompts[type],
          context: { perihal: data.perihal, type: type }
        })
      });

      const result = await response.json();
      console.log(`[AI] Received result for ${type}:`, result);

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Terjadi kesalahan pada server AI.');
      }

      let rawText = result.text || '';
      if (!rawText || rawText.length < 5) {
        throw new Error('AI tidak memberikan respon yang memadai. Silakan coba lagi.');
      }

      // Cleaning logic
      let cleanText = rawText.trim();
      
      // 1. Remove Markdown code blocks
      cleanText = cleanText.replace(/```(json)?/g, '').replace(/```/g, '').trim();

      // 2. Remove common AI introductory phrases (Case Insensitive)
      const introPatterns = [
        /^(tentu|oke|baik|ini|berikut|berikut adalah|berikut ini|ini adalah|berikut narasinya|tentu saja)[^:\n]*:/gi,
        /^saya akan buatkan[^:\n]*:/gi,
        /^latar belakang[^:\n]*:/gi,
        /^surat pengantar[^:\n]*:/gi,
        /^penutup[^:\n]*:/gi
      ];
      
      introPatterns.forEach(pattern => {
        cleanText = cleanText.replace(pattern, '').trim();
      });

      console.log(`[AI] Cleaned text for ${type}:`, cleanText.substring(0, 50) + '...');
      
      if (type === 'objectives') {
        try {
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          const cleanJson = jsonMatch ? jsonMatch[0] : cleanText;
          const parsed = JSON.parse(cleanJson);
          
          let list: string[] = [];
          if (Array.isArray(parsed.tujuan)) list = parsed.tujuan;
          else if (Array.isArray(parsed)) list = parsed;
          else list = [cleanText];
          
          // Use functional update for setData
          setData(prev => ({ ...prev, tujuan: list }));
          console.log(`[AI] Updated objectives list:`, list);
        } catch (e) {
          console.warn(`[AI] JSON parsing failed for objectives, falling back to line splitting.`, e);
          const lines = cleanText.split('\n')
            .map(l => l.replace(/^\d+[\.\)]\s*/, '').replace(/^-\s*/, '').trim())
            .filter(l => l.length > 5);
          // Use functional update for setData
          setData(prev => ({ ...prev, tujuan: lines.length > 0 ? lines : [cleanText] }));
        }
      } else {
        const fieldMap: Record<string, keyof ProposalData> = {
          'background': 'latarBelakang',
          'cover-letter': 'suratPengantar',
          'closing': 'penutup'
        };
        
        const field = fieldMap[type];
        if (field) {
          // Use functional update for setData
          setData(prev => ({ ...prev, [field]: cleanText }));
          console.log(`[AI] Updated field: ${field}`);
        }
      }
      return type;
    };

    toast.promise(promise(), {
      loading: `Generate AI sedang merumuskan konten terbaik...`,
      success: (resType) => {
        setIsAiLoading(null);
        return `Generate AI Berhasil! Konten ${resType === 'cover-letter' ? 'Surat Pengantar' : resType === 'background' ? 'Latar Belakang' : resType === 'objectives' ? 'Maksud & Tujuan' : 'Penutup'} telah diperbarui.`;
      },
      error: (err) => {
        setIsAiLoading(null);
        console.error(`[AI Error]:`, err);
        return `Generate Gagal: ${err.message || 'Cek koneksi/API'}`;
      }
    });
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
          title: (data.perihal || 'Proposal Tanpa Judul').trim(),
          type: 'PROPOSAL',
          date: new Date(dateInput || new Date()).toISOString(),
          content: JSON.stringify({ ...data, bulkRecipients }),
          recipient: bulkRecipients.length > 0 ? `${bulkRecipients.length} Penerima` : (data.penerima.nama || 'Penerima'),
          location: data.tempat,
          nomorSurat: data.nomor,
          status: 'pending'
        })
      })

      if (response.ok) {
        toast.success(proposalId ? 'Perubahan berhasil disimpan' : 'Proposal berhasil disimpan ke Riwayat Persuratan')
        setTimeout(() => router.push('/admin/persuratan/proposal'), 1500)
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

  const generatePDF = async (forceSingle: boolean = false) => {
    const captureContainer = document.getElementById('proposal-capture-container')
    if (!captureContainer) {
        toast.error('Gagal memproses render PDF. Silakan coba lagi.')
        return
    }
    setIsGeneratingPDF(true)
    
    try {
      // Tunggu hingga font benar-benar terbaca
      await document.fonts.ready;
      
      const isBulk = bulkRecipients.length > 0 && !forceSingle;

      // Konfigurasi Standar html2canvas untuk kecepatan
      const canvasOptions = {
        scale: 2, // Standard scale for better reliability
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        scrollY: 0,
        scrollX: 0,
        removeContainer: true,
        imageTimeout: 15000, // Wait longer for images
        onclone: (clonedDoc: Document) => {
          // Convert oklch() colors to hex for html2canvas compatibility
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
      };

      if (isBulk) {
        setIsBulkProcessing(true)
        setBulkProgress(0)
        toast.info(`Menyiapkan ${bulkRecipients.length} PDF...`)
        const zip = new JSZip()
        
        for (let i = 0; i < bulkRecipients.length; i++) {
          setCurrentRecipientIndex(i)
          setBulkProgress(Math.round(((i + 1) / bulkRecipients.length) * 100))
          
          // Beri waktu DOM untuk merender ulang konten penerima
          await new Promise(resolve => setTimeout(resolve, 400))
          
          // Gunakan container tersembunyi untuk penangkapan yang stabil
            const captureContainer = document.getElementById('proposal-capture-container')
            if (!captureContainer) throw new Error('Capture container not found')
            
            const doc = new jsPDF('p', 'mm', 'a4')
            const pages = captureContainer.querySelectorAll('.proposal-page')
            
            for (let j = 0; j < pages.length; j++) {
              const page = pages[j] as HTMLElement
              const canvas = await html2canvas(page, {
                ...canvasOptions,
                onclone: (clonedDoc, clonedElement) => {
                  // Convert oklch() colors to hex for html2canvas compatibility
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
                  
                  const container = clonedElement.parentElement;
                  if (container) {
                     container.style.transform = 'none';
                     container.style.scale = '1';
                  }
                }
              })
            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            if (j > 0) doc.addPage()
            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'MEDIUM')
          }
          
          const pdfBlob = doc.output('blob')
          const fileName = `Proposal_${bulkRecipients[i].nama.replace(/[^a-z0-9]/gi, '_')}.pdf`
          zip.file(fileName, pdfBlob)
        }
        
        const zipContent = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(zipContent)
        link.download = `Batch_Proposal_${data.perihal.replace(/[^a-z0-9]/gi, '_')}.zip`
        link.click()
        setIsBulkProcessing(false)
        toast.success('Batch PDF berhasil diunduh dalam bentuk ZIP')
      } else {
        toast.info('Sedang merender PDF...')
        
        // Beri waktu sejenak agar DOM stabil
        await new Promise(resolve => setTimeout(resolve, 300))

        const captureContainer = document.getElementById('proposal-capture-container')
        if (!captureContainer) throw new Error('Capture container not found')

        const doc = new jsPDF('p', 'mm', 'a4')
        const pages = captureContainer.querySelectorAll('.proposal-page')
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement
          const canvas = await html2canvas(page, {
            ...canvasOptions,
            onclone: (clonedDoc, clonedElement) => {
              // Convert oklch() colors to hex for html2canvas compatibility
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
              
              const container = clonedElement.parentElement;
              if (container) {
                 container.style.transform = 'none';
                 container.style.scale = '1';
              }
            }
          })
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95)
          if (i > 0) doc.addPage()
          doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'MEDIUM')
        }
        
        // Use blob method for better download reliability
        const pdfBlob = doc.output('blob')
        const url = URL.createObjectURL(pdfBlob)
        const fileName = `Proposal_${data.perihal.replace(/[^a-z0-9]/gi, '_')}.pdf`
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast.success('PDF Proposal berhasil diunduh')
      }
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error('Gagal membuat PDF. Coba segarkan halaman.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <AdminLayout title="Proposal Builder" subtitle="Buat proposal premium DKM Al-Muhajirin">
    <>
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
              <Wallet className="h-4 w-4 mr-2" /> RAB
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
                        <a 
                            href="/template_penerima_proposal.xlsx" 
                            download 
                            className="flex items-center px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors whitespace-nowrap"
                        >
                             <Download className="h-4 w-4 mr-2" /> Template
                        </a>
                        <Label 
                            htmlFor="excel-upload" 
                            className="cursor-pointer flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-emerald-200"
                        >
                             <Upload className="h-4 w-4 mr-2" /> Upload Excel
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
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold flex items-center gap-2"
                    >
                      {isAiLoading === 'cover-letter' ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Generate AI
                    </Button>
                  </div>
                  <Textarea 
                    id="ai-surat-pengantar"
                    value={data.suratPengantar} 
                    onChange={(e) => setData({ ...data, suratPengantar: e.target.value })}
                    className={`min-h-[200px] rounded-3xl border-slate-200 p-6 bg-slate-50/30 transition-all duration-500 ${isAiLoading === 'cover-letter' ? 'animate-pulse border-emerald-400 ring-2 ring-emerald-100' : ''}`}
                    placeholder="Isi surat pengantar akan muncul di sini..."
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
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold flex items-center gap-2"
                    >
                      {isAiLoading === 'background' ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Generate AI
                    </Button>
                  </div>
                  <Textarea 
                    id="ai-latar-belakang"
                    value={data.latarBelakang} 
                    onChange={(e) => setData({ ...data, latarBelakang: e.target.value })}
                    className={`min-h-[150px] rounded-3xl border-slate-200 p-6 bg-slate-50/30 transition-all duration-500 ${isAiLoading === 'background' ? 'animate-pulse border-emerald-400 ring-2 ring-emerald-100' : ''}`}
                    placeholder="Narasi latar belakang akan muncul di sini..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700 ml-1">Maksud dan Tujuan</Label>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAiGenerate('objectives')}
                        disabled={isAiLoading === 'objectives'}
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold flex items-center gap-2"
                      >
                        {isAiLoading === 'objectives' ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                        Generate AI
                      </Button>
                      <Button onClick={addTujuan} variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold flex items-center gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Poin
                      </Button>
                    </div>
                  </div>
                  <div className={`space-y-3 transition-all duration-500 ${isAiLoading === 'objectives' ? 'animate-pulse opacity-50' : ''}`}>
                    {data.tujuan.map((t, i) => (
                      <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center justify-center w-8 h-12 text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl">{i+1}</div>
                        <Input value={t} onChange={(e) => updateTujuan(i, e.target.value)} className="rounded-xl h-12 border-slate-200 bg-white" />
                        <Button variant="ghost" size="icon" onClick={() => removeTujuan(i)} className="text-rose-500 rounded-xl hover:bg-rose-50">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    {data.tujuan.length === 0 && (
                      <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold italic text-sm">
                        Belum ada poin tujuan. Gunakan "Saran AI" atau "Tambah Poin".
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-slate-100">
                  <Button 
                    onClick={() => setActiveTab('struktur')} 
                    className="h-12 px-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-emerald-100 group transition-all">
                    Lanjut ke Struktur <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="struktur" className="space-y-10 mt-0">
                 <div className="space-y-6">
                    <h3 className="font-bold text-lg text-slate-800 border-l-4 border-emerald-500 pl-4">Pimpinan Utama</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.struktur.pimpinanAtas.map((p, i) => (
                        <div key={i} className="space-y-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                           <Label className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{p.role}</Label>
                           <div className="space-y-2">
                               <Select onValueChange={(val) => {
                                   if (val) updateStrukturName('pimpinanAtas', i, val)
                               }}>
                                  <SelectTrigger className="h-9 text-xs rounded-lg bg-white border-slate-200">
                                      <SelectValue placeholder="Pilih dari Struktur..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {strukturOrganisasi.map((s, idx) => (
                                          <SelectItem key={idx} value={s.name}>
                                              <div className="flex flex-col text-left">
                                                  <span className="font-bold">{s.name}</span>
                                                  <span className="text-[10px] text-slate-400">{s.position}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                               </Select>
                               <Input 
                                  value={p.name} 
                                  className="h-11 rounded-xl bg-white font-medium" 
                                  onChange={(e) => updateStrukturName('pimpinanAtas', i, e.target.value)} 
                                  placeholder="Nama Pejabat..."
                               />
                           </div>
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
                            <div className="space-y-2">
                               <Select onValueChange={(val) => {
                                   if (val) updateStrukturName('administrasi', i, val)
                               }}>
                                  <SelectTrigger className="h-9 text-xs rounded-lg bg-white border-slate-200">
                                      <SelectValue placeholder="Pilih dari Struktur..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {strukturOrganisasi.map((s, idx) => (
                                          <SelectItem key={idx} value={s.name}>
                                              <div className="flex flex-col text-left">
                                                  <span className="font-bold">{s.name}</span>
                                                  <span className="text-[10px] text-slate-400">{s.position}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                               </Select>
                               <Input 
                                  value={p.name} 
                                  className="h-11 rounded-xl bg-white font-medium" 
                                  onChange={(e) => updateStrukturName('administrasi', i, e.target.value)} 
                                  placeholder="Nama Pejabat..."
                               />
                            </div>
                        </div>
                      ))}
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

                  <div className="flex justify-between pt-10 border-t border-slate-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('umum')} 
                      className="text-slate-400 group font-black uppercase text-[10px] tracking-widest hover:text-slate-600">
                      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('rab')} 
                      className="h-12 px-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-indigo-100 group transition-all">
                      Lanjut ke RAB <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
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

                <div className="flex justify-between pt-10 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveTab('struktur')} 
                    className="text-slate-400 group font-black uppercase text-[10px] tracking-widest hover:text-slate-600">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('ttd')} 
                    className="h-12 px-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-purple-100 group transition-all">
                    Lanjut ke Tanda Tangan <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
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
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl h-8 font-bold flex items-center gap-2"
                    >
                      {isAiLoading === 'closing' ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Generate AI
                    </Button>
                  </div>
                  <Textarea 
                    id="ai-penutup"
                    value={data.penutup} 
                    onChange={(e) => setData({...data, penutup: e.target.value})} 
                    className={`min-h-[150px] rounded-3xl border-slate-200 p-6 bg-slate-50/30 transition-all duration-500 ${isAiLoading === 'closing' ? 'animate-pulse border-emerald-400 ring-2 ring-emerald-100' : ''}`}
                    placeholder="Kalimat penutup akan muncul di sini..."
                  />
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

                  <div className="flex justify-between pt-10 border-t border-slate-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('rab')} 
                      className="text-slate-400 group font-black uppercase text-[10px] tracking-widest hover:text-slate-600">
                      <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('foto')} 
                      className="h-12 px-10 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-pink-100 group transition-all">
                      Lanjut ke Lampiran Foto <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
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
                 className="flex-1 h-16 rounded-3xl font-black bg-[#0b3d2e] hover:bg-[#062c21] shadow-xl shadow-emerald-100 text-white text-lg transition-all active:scale-95"
                 onClick={handleSave}
                 disabled={isSaving}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
          </Card>
        </Tabs>
      </div>
      )}



      {/* PREVIEW SECTION */}
      <div className={isViewMode ? "fixed inset-0 overflow-y-auto flex justify-center py-12 px-6 bg-slate-100/80 backdrop-blur-md z-50 animate-in fade-in duration-500" : "w-full lg:w-[500px] xl:w-[650px] 2xl:w-[850px] shrink-0 sticky top-6 h-fit max-h-[calc(100vh-48px)] transition-all duration-500"}>
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-black text-xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
                Preview <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] px-2.5 py-0.5 rounded-full">LIVE</Badge>
              </h2>
              {bulkRecipients.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <Users className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{bulkRecipients.length} Penerima Excel</span>
                  </div>
                  {bulkRecipients.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl px-2 shadow-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg hover:bg-slate-100"
                        onClick={() => setCurrentRecipientIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentRecipientIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-bold text-slate-600 px-1 min-w-[40px] text-center">{currentRecipientIndex + 1} / {bulkRecipients.length}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg hover:bg-slate-100"
                        onClick={() => setCurrentRecipientIndex(prev => Math.min(bulkRecipients.length - 1, prev + 1))}
                        disabled={currentRecipientIndex === bulkRecipients.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {bulkRecipients.length > 1 && (
                    <Button onClick={() => generatePDF(false)} disabled={isGeneratingPDF} className="flex-1 sm:flex-none h-11 px-5 rounded-2xl font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 text-xs">
                        <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Proses...' : 'Unduh ZIP'}
                    </Button>
                )}
                <Button onClick={() => generatePDF(true)} disabled={isGeneratingPDF} className="flex-1 sm:flex-none h-11 px-5 rounded-2xl font-bold bg-slate-900 border-none shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 text-white text-xs">
                    <Download className="mr-2 h-4 w-4" /> {isGeneratingPDF ? 'Proses...' : 'Unduh PDF'}
                </Button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2 sm:p-6 rounded-[3rem] shadow-xl shadow-slate-200/30 overflow-x-hidden overflow-y-auto space-y-12 flex flex-col items-center custom-scrollbar scroll-smooth" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              <div ref={previewRef} id="proposal-preview-container" className="flex flex-col gap-10 scale-[0.35] sm:scale-[0.5] md:scale-[0.55] lg:scale-[0.55] xl:scale-[0.75] 2xl:scale-[1.0] origin-top transition-all duration-500">
                {/* Visible Preview (with cover) */}
                <PageCover data={data} />
                <Page1 data={data} bulkRecipient={bulkRecipients.length > 0 ? bulkRecipients[currentRecipientIndex] : null} onNavigate={setActiveTab} />
                <Page2 data={data} />
                <Page3 data={data} />
                <Page4 data={data} />
                <Page5 data={data} onNavigate={setActiveTab} />
                {data.lampiranFoto.length > 0 && <Page6 data={data} />}
              </div>

              {/* Hidden Container for PDF Capture (with cover) */}
              <div style={{ position: 'absolute', left: '-5000px', top: 0 }}>
                <div id="proposal-capture-container" className="flex flex-col gap-0" style={{ width: '794px', fontFamily: "'Crimson Pro', serif" }}>
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
                <DialogDescription className="text-center text-slate-500">
                  Mohon tunggu, sistem sedang merender file PDF Anda satu per satu.
                </DialogDescription>
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
    </>
    </AdminLayout>
  )
}

export default function ProposalBuilderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Memuat asisten proposal...</div>}>
            <ProposalBuilderContent />
        </Suspense>
    )
}
