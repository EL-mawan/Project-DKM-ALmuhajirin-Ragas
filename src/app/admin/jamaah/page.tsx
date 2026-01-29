'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  MapPin,
  Phone,
  Home,
  GraduationCap,
  Loader2,
  Filter,
  Download
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusPopup } from '@/components/ui/status-popup'
import { useStatusPopup } from '@/lib/hooks/use-status-popup'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function JamaahAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('kk')
  const [rtFilter, setRtFilter] = useState<string>('015') // Filter RT
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { statusProps, showSuccess, showError } = useStatusPopup()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nomor: '',
    blok: '',
    rt: '015',
    rw: '008',
    keterangan: '',
    address: '',
    birthDate: '',
    education: '',
    skills: ''
  })

  const fetchData = async (type: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jamaah?type=${type}`)
      const json = await res.json()
      if (res.ok) {
        setData(Array.isArray(json) ? json : [])
      } else {
        setData([])
      }
    } catch (error) {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  // Helper for Enter key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
      if ((e.target as any).type === 'submit') return;
      
      e.preventDefault();
      const form = (e.target as any).form;
      if (!form) return;
      
      const index = Array.prototype.indexOf.call(form, e.target);
      let nextIndex = index + 1;
      let nextElement = form.elements[nextIndex] as HTMLElement;
      
      // Skip Batal/Cancel buttons or elements with 'skip-enter' class
      while (nextElement && (
        nextElement.tagName === 'BUTTON' && 
        (nextElement.textContent?.toLowerCase().includes('batal') || 
         nextElement.textContent?.toLowerCase().includes('cancel') ||
         nextElement.classList.contains('skip-enter'))
      )) {
        nextIndex++;
        nextElement = form.elements[nextIndex] as HTMLElement;
      }
      
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const url = editingItem ? `/api/admin/jamaah/${editingItem.id}` : '/api/admin/jamaah'
      const method = editingItem ? 'PATCH' : 'POST'

      const payload = { ...formData, type: activeTab }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        showSuccess(
          'Berhasil!',
          `Data jamaah telah berhasil disimpan ke database.`
        )
        setIsModalOpen(false)
        resetForm()
        fetchData(activeTab)
      } else {
        const err = await res.json()
        showError('Gagal Menyimpan', err.details || err.error || 'Terjadi kesalahan sistem.')
      }
    } catch (error: any) {
      showError('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data jamaah ini?')) return
    try {
      const res = await fetch(`/api/admin/jamaah/${id}?type=${activeTab}`, { method: 'DELETE' })
      if (res.ok) {
        showSuccess('Dihapus', 'Data telah berhasil dihapus.')
        fetchData(activeTab)
      }
    } catch (error) {
      showError('Error', 'Gagal menghapus data.')
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: '', phone: '', address: '',
      nomor: '', blok: '', rt: '015', rw: '008', keterangan: '',
      birthDate: '', education: '', skills: ''
    })
  }

  // Filter data berdasarkan search dan RT
  const filteredData = (Array.isArray(data) ? data : []).filter((item: any) => {
    const matchesSearch = item?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (activeTab === 'kk' ? item?.blok?.toLowerCase() : item?.address?.toLowerCase())?.includes(search.toLowerCase())
    
    const matchesRT = activeTab === 'kk' 
      ? (rtFilter === 'all' || item?.rt === rtFilter)
      : true
    
    return matchesSearch && matchesRT
  }).sort((a, b) => {
    const numA = parseInt(a.nomor) || 0
    const numB = parseInt(b.nomor) || 0
    return numA - numB
  })

  // Urutkan data berdasarkan nomor untuk PDF
  const sortedDataForPDF = [...filteredData].sort((a, b) => parseInt(a.nomor) - parseInt(b.nomor))

  // PDF Generation for Kepala Keluarga
  const generatePDF = () => {
    const doc = new jsPDF()
    const rtLabel = rtFilter === 'all' ? '015 & 016' : rtFilter
    const itemsPerPage = 60
    const itemsPerColumn = 30

    // Split data into chunks of 60 (one page per chunk)
    for (let i = 0; i < sortedDataForPDF.length; i += itemsPerPage) {
      if (i > 0) doc.addPage()

      // HEADER
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Masyarakat Kp. Ragas Grenyang Masjid Al-Muhajirin', 105, 12, { align: 'center' })
      
      doc.setFontSize(12)
      doc.text(`RT. ${rtLabel}`, 105, 18, { align: 'center' })

      const chunk = sortedDataForPDF.slice(i, i + itemsPerPage)
      const leftHalf = chunk.slice(0, itemsPerColumn)
      const rightHalf = chunk.slice(itemsPerColumn, itemsPerPage)

      const tableColumn = ["No", "Nama", "Blok/Link", "Ket.", "Nominal (Rp)"]
      const tableStyles = {
        theme: 'grid' as const,
        headStyles: { 
          fillColor: [11, 61, 46] as [number, number, number], 
          textColor: [255, 255, 255] as [number, number, number], 
          fontStyle: 'bold' as const, 
          halign: 'center' as const, 
          fontSize: 8 
        },
        styles: { 
          fontSize: 7.5, 
          cellPadding: 1.5, 
          lineColor: [180, 180, 180] as [number, number, number], 
          lineWidth: 0.1 
        },
        columnStyles: {
          0: { halign: 'center' as const, cellWidth: 8 },
          1: { cellWidth: 32 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 }
        }
      }

      // Draw Left Table
      autoTable(doc, {
        ...tableStyles,
        head: [tableColumn],
        body: leftHalf.map((item) => [
          item.nomor,
          item.name,
          item.blok,
          item.keterangan || '-',
          ""
        ]),
        startY: 25,
        margin: { right: 107, left: 10 },
      })

      // Draw Right Table
      if (rightHalf.length > 0) {
        autoTable(doc, {
          ...tableStyles,
          head: [tableColumn],
          body: rightHalf.map((item) => [
            item.nomor,
            item.name,
            item.blok,
            item.keterangan || '-',
            ""
          ]),
          startY: 25,
          margin: { left: 107, right: 10 },
        })
      }
    }

    doc.save(`Data_Jamaah_RT_${rtLabel}_${new Date().toLocaleDateString('id-ID')}.pdf`)
  }

  // PDF Generation for Remaja Masjid
  const generateRMPDF = () => {
    const doc = new jsPDF()
    const itemsPerPage = 60
    const itemsPerColumn = 30

    // Split data into chunks of 60 (one page per chunk)
    for (let i = 0; i < filteredData.length; i += itemsPerPage) {
      if (i > 0) doc.addPage()

      // HEADER
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Data Remaja Masjid Al-Muhajirin Ragas', 105, 12, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 105, 18, { align: 'center' })

      const chunk = filteredData.slice(i, i + itemsPerPage)
      const leftHalf = chunk.slice(0, itemsPerColumn)
      const rightHalf = chunk.slice(itemsPerColumn, itemsPerPage)

      const tableColumn = ["No", "Nama Lengkap", "Pendidikan", "No. HP"]
      const tableStyles = {
        theme: 'grid' as const,
        headStyles: { 
          fillColor: [11, 61, 46] as [number, number, number], 
          textColor: [255, 255, 255] as [number, number, number], 
          fontStyle: 'bold' as const, 
          halign: 'center' as const, 
          fontSize: 8 
        },
        styles: { 
          fontSize: 7.5, 
          cellPadding: 1.5, 
          lineColor: [180, 180, 180] as [number, number, number], 
          lineWidth: 0.1 
        },
        columnStyles: {
          0: { halign: 'center' as const, cellWidth: 8 },
          1: { cellWidth: 35 },
          2: { cellWidth: 27 },
          3: { cellWidth: 25 }
        }
      }

      // Draw Left Table
      autoTable(doc, {
        ...tableStyles,
        head: [tableColumn],
        body: leftHalf.map((item, index) => [
          i + index + 1,
          item.name,
          item.education || '-',
          item.phone || '-'
        ]),
        startY: 25,
        margin: { right: 107, left: 10 },
      })

      // Draw Right Table
      if (rightHalf.length > 0) {
        autoTable(doc, {
          ...tableStyles,
          head: [tableColumn],
          body: rightHalf.map((item, index) => [
            i + itemsPerColumn + index + 1,
            item.name,
            item.education || '-',
            item.phone || '-'
          ]),
          startY: 25,
          margin: { left: 107, right: 10 },
        })
      }
    }

    doc.save(`Data_Remaja_Masjid_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Statistik RT
  const rt015Count = data.filter(item => item?.rt === '015' || (item?.address && item.address.toUpperCase().includes('RT.015')) || (item?.address && item.address.toUpperCase().includes('RT 015'))).length
  const rt016Count = data.filter(item => item?.rt === '016' || (item?.address && item.address.toUpperCase().includes('RT.016')) || (item?.address && item.address.toUpperCase().includes('RT 016'))).length
  const totalCount = data.length

  return (
    <AdminLayout title="Data Jamaah" subtitle="Kelola database warga & remaja Masjid.">
      <div className="p-6 sm:p-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="rounded-2xl sm:rounded-4xl border-none shadow-sm bg-emerald-50/50">
            <CardContent className="p-3 sm:p-6">
              <p className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">RT 015</p>
              <h3 className="text-xl sm:text-3xl font-black text-[#0b3d2e] mt-0.5 sm:mt-1">{rt015Count} {activeTab === 'kk' ? 'KK' : 'RM'}</h3>
            </CardContent>
          </Card>
          <Card className="rounded-2xl sm:rounded-4xl border-none shadow-sm bg-blue-50/50">
            <CardContent className="p-3 sm:p-6">
              <p className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">RT 016</p>
              <h3 className="text-xl sm:text-3xl font-black text-[#0b3d2e] mt-0.5 sm:mt-1">{rt016Count} {activeTab === 'kk' ? 'KK' : 'RM'}</h3>
            </CardContent>
          </Card>
          <Card className="rounded-2xl sm:rounded-4xl border-none shadow-sm bg-indigo-50/50">
            <CardContent className="p-3 sm:p-6">
              <p className="text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total {activeTab === 'kk' ? '' : 'RM'}</p>
              <h3 className="text-xl sm:text-3xl font-black text-[#0b3d2e] mt-0.5 sm:mt-1">{totalCount} {activeTab === 'kk' ? 'KK' : 'RM'}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={activeTab} className="w-full md:w-auto" onValueChange={(val) => setActiveTab(val)}>
            <TabsList className="bg-white border rounded-2xl p-1 h-12 shadow-sm">
              <TabsTrigger value="kk" className="rounded-xl px-6 font-bold">Kepala Keluarga</TabsTrigger>
              <TabsTrigger value="remaja" className="rounded-xl px-6 font-bold">Remaja Masjid</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="rounded-xl shadow-md bg-white border-emerald-100 text-[#0b3d2e] flex-1 sm:flex-none py-6 sm:py-2"
              onClick={activeTab === 'kk' ? generatePDF : generateRMPDF}
              disabled={filteredData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Unduh PDF
            </Button>
            
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-lg flex-1 sm:flex-none py-6 sm:py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah {activeTab === 'kk' ? 'Warga' : 'Remaja'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] rounded-[2.5rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                    {editingItem ? 'Edit Data' : 'Tambah Data'} {activeTab === 'kk' ? 'Kepala Keluarga' : 'Remaja'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Lengkap*</Label>
                      <Input 
                        required 
                        className="rounded-xl h-12"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>No. HP/WA</Label>
                      <Input 
                        className="rounded-xl h-12"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    {activeTab === 'kk' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Nomor (ID/Urutan) - Kosongkan untuk Otomatis</Label>
                          <Input 
                            className="rounded-xl h-12"
                            placeholder="Contoh: 001"
                            value={formData.nomor}
                            onChange={e => setFormData({...formData, nomor: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Blok / Link*</Label>
                          <Input 
                            required
                            className="rounded-xl h-12"
                            value={formData.blok}
                            onChange={e => setFormData({...formData, blok: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>RT*</Label>
                          <RadioGroup 
                            value={formData.rt} 
                            onValueChange={(val) => setFormData({...formData, rt: val})}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="015" id="rt015" />
                              <Label htmlFor="rt015" className="cursor-pointer font-bold">RT 015</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="016" id="rt016" />
                              <Label htmlFor="rt016" className="cursor-pointer font-bold">RT 016</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Keterangan</Label>
                          <Input 
                            className="rounded-xl h-12"
                            value={formData.keterangan}
                            onChange={e => setFormData({...formData, keterangan: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Tgl Lahir</Label>
                          <Input 
                            type="date"
                            className="rounded-xl h-12"
                            value={formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : ''}
                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pendidikan Terakhir</Label>
                          <Input 
                            className="rounded-xl h-12"
                            value={formData.education}
                            onChange={e => setFormData({...formData, education: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Alamat (Remaja)*</Label>
                          <Input 
                            required={activeTab === 'remaja'}
                            className="rounded-xl h-12"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {activeTab === 'remaja' && (
                    <div className="space-y-2">
                      <Label>Keahlian / Skill</Label>
                      <Input 
                        className="rounded-xl h-12"
                        placeholder="Contoh: Desain Grafis, IT, dll"
                        value={formData.skills}
                        onChange={e => setFormData({...formData, skills: e.target.value})}
                      />
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full rounded-2xl py-6 font-bold mt-4 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {isSubmitting ? 'Memproses...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Data')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">
                {activeTab === 'kk' ? 'Data Kepala Keluarga' : 'Data Remaja Masjid'}
              </CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                {activeTab === 'kk' && (
                  <div className="flex gap-2">
                    <Button
                      variant={rtFilter === '015' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setRtFilter('015')}
                    >
                      RT 015
                    </Button>
                    <Button
                      variant={rtFilter === '016' ? 'default' : 'outline'}
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setRtFilter('016')}
                    >
                      RT 016
                    </Button>
                  </div>
                )}
                <div className="relative flex-1 md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={`Cari nama atau ${activeTab === 'kk' ? 'blok' : 'pendidikan'}...`}
                    className="pl-10 rounded-full bg-gray-50/50 border-gray-100 focus:bg-white transition-all h-10"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Belum ada data jamaah.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      {activeTab === 'kk' ? (
                        <>
                          <th className="px-4 py-5 w-12 text-center">No.</th>
                          <th className="px-6 py-5 min-w-[250px]">Nama Lengkap</th>
                          <th className="px-6 py-5">Blok/Link</th>
                          <th className="px-6 py-5">Keterangan</th>
                          <th className="px-6 py-5 text-right w-24">Aksi</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-5 min-w-[250px]">Nama & Detail</th>
                          <th className="px-6 py-5">Lokasi / Alamat</th>
                          <th className="px-6 py-5">Info Lain</th>
                          <th className="px-6 py-5 text-right w-24">Aksi</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        {activeTab === 'kk' ? (
                          <>
                            <td className="px-4 py-6 text-center">
                              <div className="font-bold text-emerald-600">{item.nomor}</div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="font-black text-lg text-[#0b3d2e] tracking-tight">{item.name}</div>
                              {item.phone && (
                                <div className="text-[10px] text-slate-400 font-bold flex items-center mt-1 uppercase tracking-widest">
                                  <Phone className="h-2.5 w-2.5 mr-1.5 text-emerald-500 shrink-0" /> {item.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6">
                              <div className="font-bold text-slate-700 text-sm">{item.blok}</div>
                              <Badge variant="outline" className="text-[9px] uppercase font-black bg-slate-50 border-emerald-100 mt-1 px-2 py-0">
                                RT {item.rt}
                              </Badge>
                            </td>
                            <td className="px-6 py-6">
                              <div className="text-xs text-slate-500 font-medium italic max-w-xs line-clamp-2 leading-relaxed">
                                {item.keterangan || '-'}
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-6">
                              <div className="font-black text-lg text-[#0b3d2e] tracking-tight">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center">
                                <GraduationCap className="h-3 w-3 mr-1.5 text-emerald-500" /> {item.education || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-6 font-medium">
                              <div className="text-xs text-slate-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1.5 text-emerald-500 shrink-0" /> 
                                <span className="line-clamp-1">{item.address}</span>
                              </div>
                              {item.phone && (
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mt-1">
                                  <Phone className="h-2.5 w-2.5 mr-1.5 text-emerald-500 shrink-0" /> {item.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-6">
                              <div className="text-xs font-bold text-slate-500 line-clamp-2 italic">
                                {item.skills || 'Tidak ada info skill'}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 hover:bg-primary/5 hover:text-primary"
                              onClick={() => {
                                setEditingItem(item)
                                setFormData({
                                  name: item.name,
                                  address: item.address || '',
                                  phone: item.phone || '',
                                  nomor: item.nomor || '',
                                  blok: item.blok || '',
                                  rt: item.rt || '015',
                                  rw: item.rw || '008',
                                  keterangan: item.keterangan || '',
                                  birthDate: item.birthDate || '',
                                  education: item.education || '',
                                  skills: item.skills || ''
                                })
                                setIsModalOpen(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => handleDelete(item.id)}
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
