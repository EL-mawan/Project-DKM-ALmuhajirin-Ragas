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
  MessageSquare,
  Plus,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
    
    // --- PROPOSAL TABS STATE ---
    isiSuratPengantar: '',
    latarBelakang: '',
    maksudTujuanList: [] as string[],
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
    kalimatPenutup: 'Demikian proposal ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.',
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
  const applyAIRecommend = (field: string) => {
    const templates: Record<string, string | string[]> = {
      isiSuratPengantar: "Bersama dengan surat ini, kami selaku pengurus DKM Al-Muhajirin bermaksud untuk mengajukan permohonan dukungan dan bantuan dana untuk kegiatan yang akan kami laksanakan. Semoga bapak/ibu dapat memberikan dukungan positif demi kelancaran kegiatan tersebut.",
      latarBelakang: "Sehubungan dengan meningkatnya kebutuhan akan sarana ibadah yang memadai dan upaya untuk meningkatkan ukhuwah islamiyah di lingkungan Kp. Ragas Grenyang, maka kami memandang perlu untuk mengadakan kegiatan/pembangunan ini sebagai bagian dari program kerja tahunan DKM Al-Muhajirin.",
      maksudTujuan: ["Meningkatkan kualitas sarana ibadah", "Mempererat tali silaturahmi antar jamaah", "Menciptakan lingkungan yang religius dan nyaman"],
      kalimatPenutup: "Demikian proposal ini kami susun dengan harapan mendapatkan pertimbangan dan dukungan dari Bapak/Ibu. Atas perhatian dan kerjasamanya kami haturkan terima kasih yang sebesar-besarnya. Semoga Allah SWT membalas segala bentuk kebaikan Bapak/Ibu dengan pahala yang berlipat ganda."
    }

    if (field === 'maksudTujuan') {
      setFormData(prev => ({ ...prev, maksudTujuanList: templates[field] as string[] }))
    } else {
      setFormData(prev => ({ ...prev, [field]: templates[field] }))
    }
    toast.success(`Rekomendasi AI untuk ${field} diterapkan!`)
  }

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

    // --- KOP SURAT (TIMES NEW ROMAN) ---
    doc.setFont('times', 'bold').setFontSize(14)
    const titleLines = doc.splitTextToSize(formData.namaKopSurat, 170)
    doc.text(titleLines, centerX, 20, { align: 'center' })
    
    doc.setFontSize(8).setFont('times', 'normal')
    const addressLines = doc.splitTextToSize(formData.alamatKopSurat, 170)
    doc.text(addressLines, centerX, 30, { align: 'center' })

    const contactY = 30 + (addressLines.length * 4) + 2
    doc.setFont('times', 'italic').text(formData.kontakKopSurat, centerX, contactY, { align: 'center' })
    const lineY = contactY + 3
    doc.setLineWidth(0.8).line(mLeft, lineY, pageWidth - mLeft, lineY)

    // --- INFO & RECIPIENT ---
    let curY = lineY + 15
    doc.setFontSize(11).setFont('times', 'normal')
    doc.text(`No      : ${formData.nomorSurat}`, mLeft, curY)
    doc.text(`Perihal : ${formData.perihal}`, mLeft, curY + 6)
    doc.text(`${formData.tempatSurat}, ${new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - mLeft, curY, { align: 'right' })

    curY += 20
    doc.text('Kepada Yth.', mLeft, curY)
    doc.setFont('times', 'bold').text(formData.penerimaNama || '........................', mLeft, curY + 6)
    doc.setFont('times', 'normal').text('di -', mLeft, curY + 12)
    doc.text(formData.penerimaLokasi || 'Tempat', mLeft + 10, curY + 18)

    curY += 30

    if (type === 'PROPOSAL') {
      // PAGE 1: SURAT PENGANTAR
      doc.setFont('times', 'normal')
      const pengantarLines = doc.splitTextToSize(formData.isiSuratPengantar || '[Isi Surat Pengantar]', 170)
      doc.text(pengantarLines, mLeft, curY)
      
      // SIGNATURES ON PAGE 1
      const sigY1 = 225
      const colWidth1 = (pageWidth - (mLeft * 2)) / 3
      doc.setFont('times', 'bold').text('Hormat Kami,', centerX, sigY1 - 15, { align: 'center' })
      
      doc.text('Sekretaris DKM', mLeft + (colWidth1 / 2), sigY1, { align: 'center' })
      doc.text(formData.ttdSekretarisDKM || '........................', mLeft + (colWidth1 / 2), sigY1 + 25, { align: 'center' })
      
      doc.text('Bendahara DKM', mLeft + colWidth1 + (colWidth1 / 2), sigY1, { align: 'center' })
      doc.text(formData.ttdBendaharaDKM || '........................', mLeft + colWidth1 + (colWidth1 / 2), sigY1 + 25, { align: 'center' })

      doc.text('Ketua DKM', mLeft + (colWidth1 * 2) + (colWidth1 / 2), sigY1, { align: 'center' })
      doc.text(formData.ttdKetuaDKM || '........................', mLeft + (colWidth1 * 2) + (colWidth1 / 2), sigY1 + 25, { align: 'center' })
      
      // PAGE 2: PENDAHULUAN
      doc.addPage()
      doc.setFont('times', 'bold').setFontSize(14).text(formData.namaKopSurat, centerX, 20, { align: 'center' })
      doc.setLineWidth(0.5).line(mLeft, 25, pageWidth - mLeft, 25)
      
      let p2Y = 40
      doc.setFontSize(12).setFont('times', 'bold').text('I. PENDAHULUAN', mLeft, p2Y)
      doc.setFontSize(11).setFont('times', 'bold').text('A. Latar Belakang', mLeft, p2Y + 10)
      doc.setFontSize(10).setFont('times', 'normal')
      const p2LatarLines = doc.splitTextToSize(formData.latarBelakang || '...', 170)
      doc.text(p2LatarLines, mLeft, p2Y + 16)
      
      p2Y += 30 + (p2LatarLines.length * 5)
      doc.setFont('times', 'bold').text('B. Maksud Dan Tujuan', mLeft, p2Y)
      doc.setFontSize(10).setFont('times', 'normal')
      
      formData.maksudTujuanList.forEach((point, idx) => {
        const pointText = `${idx + 1}. ${point}`
        const pointLines = doc.splitTextToSize(pointText, 160)
        doc.text(pointLines, mLeft + 5, p2Y + 10 + (idx * 8))
      })

      // PAGE 3: STRUKTUR & RAB
      doc.addPage()
      doc.setFont('times', 'bold').setFontSize(12).text('II. STRUKTUR ORGANISASI', mLeft, 20)
      doc.setFontSize(10).setFont('times', 'normal')
      doc.text(`Pelindung (RW) : ${formData.pelindungRW}`, mLeft + 5, 30)
      doc.text(`Penasehat (RT) : ${formData.penasehatRT}`, mLeft + 5, 35)
      doc.text(`Ketua Pemuda   : ${formData.ketuaPemudaStruktur}`, mLeft + 5, 40)
      
      doc.setFont('times', 'bold').text('III. ANGGARAN BIAYA (RAB)', mLeft, 60)
      let tableY = 70
      doc.setFont('times', 'bold').text('Item', mLeft, tableY)
      doc.text('Total', pageWidth - mLeft, tableY, { align: 'right' })
      doc.line(mLeft, tableY + 2, pageWidth - mLeft, tableY + 2)
      
      formData.rabItems.forEach((item) => {
        tableY += 8
        doc.setFont('times', 'normal').text(item.item || '-', mLeft, tableY)
        doc.text(`Rp ${item.total.toLocaleString('id-ID')}`, pageWidth - mLeft, tableY, { align: 'right' })
      })
      doc.line(mLeft, tableY + 2, pageWidth - mLeft, tableY + 2)
      doc.setFont('times', 'bold').text('Total Estimasi', mLeft, tableY + 10)
      doc.text(`Rp ${totalRAB.toLocaleString('id-ID')}`, pageWidth - mLeft, tableY + 10, { align: 'right' })

      // PAGE 4: PENUTUP & SIGNATURES
      doc.addPage()
      doc.setFont('times', 'bold').setFontSize(12).text('IV. PENUTUP', mLeft, 20)
      doc.setFontSize(11).setFont('times', 'normal')
      const penutupLines = doc.splitTextToSize(formData.kalimatPenutup, 170)
      doc.text(penutupLines, mLeft, 30)
      
      let sigStartYa = 60
      doc.text(`${formData.lokasiPenerbitan}, ${new Date(formData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - mLeft, sigStartYa, { align: 'right' })
      
      sigStartYa += 15
      // Row 1: Sekretaris, Bendahara, Ketua
      doc.setFont('times', 'bold')
      const colWidth = (pageWidth - (mLeft * 2)) / 3
      
      doc.text('Sekretaris DKM', mLeft + (colWidth / 2), sigStartYa, { align: 'center' })
      doc.text(formData.ttdSekretarisDKM || '........................', mLeft + (colWidth / 2), sigStartYa + 30, { align: 'center' })
      
      doc.text('Bendahara DKM', mLeft + colWidth + (colWidth / 2), sigStartYa, { align: 'center' })
      doc.text(formData.ttdBendaharaDKM || '........................', mLeft + colWidth + (colWidth / 2), sigStartYa + 30, { align: 'center' })

      doc.text('Ketua DKM', mLeft + (colWidth * 2) + (colWidth / 2), sigStartYa, { align: 'center' })
      doc.text(formData.ttdKetuaDKM || '........................', mLeft + (colWidth * 2) + (colWidth / 2), sigStartYa + 30, { align: 'center' })
      
      if (formData.ttdTokohMasyarakat) {
        sigStartYa += 50
        doc.text('Mengetahui,', centerX, sigStartYa - 8, { align: 'center' })
        doc.setFontSize(9).text('Tokoh Masyarakat Masjid Al-Muhajirin', centerX, sigStartYa, { align: 'center' })
        doc.setFontSize(11).text(formData.ttdTokohMasyarakat, centerX, sigStartYa + 30, { align: 'center' })
      }

      // Row 3: Optional RT/RW/Pemuda
      sigStartYa += 50
      if (formData.ttdKetuaRW || formData.ttdKetuaRT) {
        if (formData.ttdKetuaRW) {
          doc.text('Ketua RW', mLeft + 40, sigStartYa, { align: 'center' })
          doc.text(formData.ttdKetuaRW, mLeft + 40, sigStartYa + 30, { align: 'center' })
        }
        if (formData.ttdKetuaRT) {
          doc.text('Ketua RT', pageWidth - mLeft - 40, sigStartYa, { align: 'center' })
          doc.text(formData.ttdKetuaRT, pageWidth - mLeft - 40, sigStartYa + 30, { align: 'center' })
        }
      }

    } else {
      doc.setFont('times', 'normal')
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

      // SIGNATURES for Undangan/Official
      const sigY = curY
      doc.setFont('times', 'bold')
      const colWidthLetter = (pageWidth - (mLeft * 2)) / 3

      doc.text('Sekretaris DKM', mLeft + (colWidthLetter / 2), sigY, { align: 'center' })
      doc.text(formData.ttdSekretarisDKM || '........................', mLeft + (colWidthLetter / 2), sigY + 25, { align: 'center' })

      doc.text('Bendahara DKM', mLeft + colWidthLetter + (colWidthLetter / 2), sigY, { align: 'center' })
      doc.text(formData.ttdBendaharaDKM || '........................', mLeft + colWidthLetter + (colWidthLetter / 2), sigY + 25, { align: 'center' })
      
      doc.text('Ketua DKM', mLeft + (colWidthLetter * 2) + (colWidthLetter / 2), sigY, { align: 'center' })
      doc.text(formData.ttdKetuaDKM || '........................', mLeft + (colWidthLetter * 2) + (colWidthLetter / 2), sigY + 25, { align: 'center' })
      
      if (formData.ttdTokohMasyarakat) {
        const sigY2 = sigY + 45
        doc.text('Mengetahui,', centerX, sigY2 - 8, { align: 'center' })
        doc.setFontSize(9).text('Tokoh Masyarakat Masjid Al-Muhajirin', centerX, sigY2, { align: 'center' })
        doc.setFontSize(11).text(formData.ttdTokohMasyarakat, centerX, sigY2 + 25, { align: 'center' })
      }
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
                    <Card className="rounded-[2rem] border-2 border-purple-50 shadow-sm bg-white overflow-hidden p-8">
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
                    <Card className="rounded-[2rem] border-2 border-slate-50 shadow-sm bg-white overflow-hidden p-8">
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
                        <Button onClick={() => applyAIRecommend('isiSuratPengantar')} variant="ghost" size="sm" className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50"><MessageSquare className="h-3 w-3 mr-2" /> Rekomendasi AI</Button>
                      </div>
                      <Textarea placeholder="Tulislah isi surat pengantar..." className="min-h-[160px] rounded-[1.5rem] border-slate-200 p-6" value={formData.isiSuratPengantar} onChange={e => setFormData({...formData, isiSuratPengantar: e.target.value})} />
                    </div>

                    {/* Section 5: NARASI LATAR BELAKANG */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-slate-600">Narasi Latar Belakang</Label>
                        <Button onClick={() => applyAIRecommend('latarBelakang')} variant="ghost" size="sm" className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50"><MessageSquare className="h-3 w-3 mr-2" /> Rekomendasi AI</Button>
                      </div>
                      <Textarea placeholder="Tulislah alasan permohonan ini diajukan..." className="min-h-[120px] rounded-[1.5rem] border-slate-200 p-6" value={formData.latarBelakang} onChange={e => setFormData({...formData, latarBelakang: e.target.value})} />
                    </div>

                    {/* Section 6: MAKSUD DAN TUJUAN */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-slate-600">Maksud dan Tujuan (Poin Ringkas)</Label>
                        <div className="flex gap-2">
                          <Button onClick={() => applyAIRecommend('maksudTujuan')} variant="ghost" size="sm" className="h-7 text-purple-600 font-bold text-[10px] uppercase hover:bg-purple-50"><MessageSquare className="h-3 w-3 mr-2" /> AI Suggesi</Button>
                          <Button onClick={addMaksudTujuan} variant="ghost" size="sm" className="h-7 text-emerald-600 font-bold text-[10px] uppercase hover:bg-emerald-50"><Plus className="h-3 w-3 mr-2" /> Tambah Manual</Button>
                        </div>
                      </div>
                      <div className="space-y-3">
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
                          <div className="h-20 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 text-[10px] font-black uppercase italic tracking-widest bg-slate-50/50">
                            Belum ada poin ditambahkan
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 7: WAKTU DAN TEMPAT */}
                    <div className="p-8 rounded-[2rem] border-2 border-slate-50 bg-white flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">Waktu dan Tempat Pelaksanaan</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Bagian ini tidak akan muncul di proposal jika dinonaktifkan.</p>
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
                          <div className="h-12 w-12 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 mb-4 animate-bounce">
                            <Users className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-[0.2em] text-center">Pimpinan Utama</h3>
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
                        <div className="h-12 w-12 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 mb-4">
                          <Layout className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-[0.2em] text-center">Pengurus Harian</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Administrasi & Keuangan</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
                           <Label className="text-[9px] uppercase font-black text-slate-300 tracking-[0.3em] block text-center italic">Sekretaris Utama</Label>
                           <Input className="h-12 rounded-2xl bg-slate-50/80 border-none font-bold text-center text-xs" placeholder="Nama Sekretaris..." value={formData.sekretarisStruktur} onChange={e => setFormData({...formData, sekretarisStruktur: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
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
                           <div className="absolute top-0 right-0 h-full w-48 bg-white/10 skew-x-[30deg] translate-x-12" />
                           <div className="relative">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Total Estimasi Anggaran</p>
                              <h2 className="text-4xl font-black tracking-tight">IDR {totalRAB.toLocaleString('id-ID')}</h2>
                           </div>
                           <div className="h-16 w-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center relative backdrop-blur-md">
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
                              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-wider">Daftar Kebutuhan</h3>
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
                                <div className="h-48 border-2 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center space-y-4 bg-slate-50/20">
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
                              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase tracking-wider">Lampiran Pendukung</h3>
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
                           <Button onClick={() => applyAIRecommend('kalimatPenutup')} variant="ghost" className="text-purple-600 font-bold text-[10px] uppercase"><MessageSquare className="h-3 w-3 mr-2" /> Rekomendasi AI</Button>
                        </div>
                        <Textarea className="min-h-[160px] rounded-3xl border-slate-200 p-6 shadow-sm bg-white font-serif" placeholder="Tuliskan kalimat penutup..." value={formData.kalimatPenutup} onChange={e => setFormData({...formData, kalimatPenutup: e.target.value})} />
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
                             <div key={idx} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                               <div className="flex items-center gap-2 mb-4">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${(item as any).required ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 opacity-50 group-hover:opacity-100'}`}>
                                    {(item as any).icon}
                                  </div>
                                  <div>
                                    <Label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">{item.label}</Label>
                                    {(item as any).subLabel && <span className="text-[8px] text-slate-300 uppercase block font-bold leading-none">{(item as any).subLabel}</span>}
                                  </div>
                               </div>
                               <Input 
                                 className="h-12 rounded-2xl border-none bg-slate-50/50 focus:bg-white text-center font-black text-xs tracking-tight placeholder:italic placeholder:font-normal" 
                                 placeholder={`Nama ${(item as any).label}...`}
                                 value={(formData as any)[item.field]} 
                                 onChange={e => setFormData({...formData, [item.field]: e.target.value})} 
                               />
                             </div>
                           ))}
                         </div>
                     </div>

                     <div className="flex justify-between pt-10">
                        <Button variant="ghost" onClick={() => setActiveTab('rab')} className="text-slate-400 group">
                          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
                        </Button>
                        <Button onClick={handleSubmit} className="h-14 px-12 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-100 animate-pulse">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block">Sekretaris DKM</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Sekretaris" value={formData.ttdSekretarisDKM} onChange={e => setFormData({...formData, ttdSekretarisDKM: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block">Ketua DKM</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Ketua" value={formData.ttdKetuaDKM} onChange={e => setFormData({...formData, ttdKetuaDKM: e.target.value})} />
                        </div>
                        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <Label className="text-[10px] uppercase font-black text-emerald-600 tracking-widest block">Bendahara DKM</Label>
                          <Input className="h-12 rounded-2xl bg-slate-50 border-none font-bold text-center" placeholder="Nama Bendahara" value={formData.ttdBendaharaDKM} onChange={e => setFormData({...formData, ttdBendaharaDKM: e.target.value})} />
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

              {/* PAPER PREVIEW - PAGE 1 */}
              <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden mb-8">
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
                    <p><span className="w-16 inline-block">Lampiran</span> : <span className="font-bold">{formData.lampiran || '-'}</span></p>
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
                <div className="text-[10px] space-y-4 text-slate-900 leading-relaxed font-serif">
                  {type === 'PROPOSAL' ? (
                    <p className="whitespace-pre-wrap">{formData.isiSuratPengantar || '[Isi Surat Pengantar Belum Diisi]'}</p>
                  ) : (
                    <>
                      <p className="font-black">Assalamu'alaikum Wr. Wb.</p>
                      <p className="whitespace-pre-wrap">{formData.pembuka}</p>

                      {type === 'UNDANGAN' && formData.namaAcara && (
                        <div className="ml-8 space-y-1 py-4 text-slate-900 font-serif italic border-l-2 border-slate-100 pl-4 bg-slate-50/30 rounded-r-xl">
                          <p><span className="w-24 inline-block font-bold">Hari / Tanggal</span> : {formData.hariAcara}, {formData.tanggalAcara}</p>
                          <p><span className="w-24 inline-block font-bold">Waktu</span> : {formData.waktuAcara}</p>
                          <p><span className="w-24 inline-block font-bold">Tempat</span> : {formData.lokasiAcara}</p>
                          <p><span className="w-24 inline-block font-bold uppercase">Acara</span> : <span className="font-black underline decoration-slate-400 decoration-2">{formData.namaAcara}</span></p>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{formData.penutup}</p>
                      <p className="font-black">Wassalamu'alaikum Wr. Wb.</p>
                    </>
                  )}
                </div>

                {/* SIGNATURES */}
                <div className="mt-16 space-y-12">
                   <div className="grid grid-cols-3 gap-4 text-[10px] text-center font-bold font-serif">
                     <div className="space-y-16">
                       <p className="uppercase tracking-widest text-[#0b3d2e] border-b border-slate-100 pb-1">Sekretaris DKM</p>
                       <div>
                         <p className="underline uppercase font-black decoration-slate-900">{formData.ttdSekretarisDKM || '............................'}</p>
                       </div>
                     </div>
                     <div className="space-y-16">
                       <p className="uppercase tracking-widest text-[#0b3d2e] border-b border-slate-100 pb-1">Bendahara DKM</p>
                       <div>
                         <p className="underline uppercase font-black decoration-slate-900">{formData.ttdBendaharaDKM || '............................'}</p>
                       </div>
                     </div>
                     <div className="space-y-16">
                       <p className="uppercase tracking-widest text-[#0b3d2e] border-b border-slate-100 pb-1">Ketua DKM</p>
                       <div>
                         <p className="underline uppercase font-black decoration-slate-900">{formData.ttdKetuaDKM || '............................'}</p>
                       </div>
                     </div>
                   </div>

                   {formData.ttdTokohMasyarakat && (
                      <div className="flex flex-col items-center text-[10px] text-center font-bold font-serif">
                        <div className="space-y-16 w-1/2">
                          <div>
                            <p className="uppercase font-black text-slate-400 text-[8px]">Mengetahui,</p>
                            <p className="uppercase tracking-widest text-[#0b3d2e] border-b border-slate-100 pb-1">Tokoh Masyarakat Masjid Al-Muhajirin</p>
                          </div>
                          <div>
                            <p className="underline uppercase font-black decoration-slate-900">{formData.ttdTokohMasyarakat}</p>
                          </div>
                        </div>
                      </div>
                   )}

                   {(formData.ttdKetuaRW || formData.ttdKetuaRT) && (
                     <div className="grid grid-cols-2 gap-8 text-[10px] text-center font-bold font-serif border-t border-slate-50 pt-8">
                        {formData.ttdKetuaRW && (
                          <div className="space-y-16">
                            <p className="uppercase tracking-widest text-slate-500">Ketua RW</p>
                            <p className="underline uppercase font-black">{formData.ttdKetuaRW}</p>
                          </div>
                        )}
                        {formData.ttdKetuaRT && (
                          <div className="space-y-16">
                            <p className="uppercase tracking-widest text-slate-500">Ketua RT</p>
                            <p className="underline uppercase font-black">{formData.ttdKetuaRT}</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              </div>

              {/* PAPER PREVIEW - PAGE 2 (PENDALUAN - Only for PROPOSAL) */}
              {type === 'PROPOSAL' && (
                <>
                  <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden mb-8">
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

                  <div id="proposal-page-3" className="bg-white shadow-2xl rounded-[2.5rem] p-8 lg:p-12 min-h-[842px] relative overflow-hidden">
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
