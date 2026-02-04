'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Download,
  Mail,
  User as UserIcon
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import jsPDF from 'jspdf'

export default function JadwalTugasPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('JUMAT')
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'KHOTIB',
    category: activeTab,
    name: '',
    description: ''
  })

  const canCreate = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Sekretaris DKM', 'RISMA (Remaja Islam)'].includes(session.user.role)
  const canUpdate = canCreate
  const canDelete = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Sekretaris DKM'].includes(session.user.role)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jadwal?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) setData(json)
    } catch (error) {
      toast.error('Gagal memuat data jadwal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true) // Show loading indicator
    try {
      const url = editingItem ? `/api/admin/jadwal/${editingItem.id}` : '/api/admin/jadwal'
      const method = editingItem ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('Submission Response Status:', res.status)
      const result = await res.json()
      console.log('Submission Result:', result)

      if (res.ok) {
        toast.success(editingItem ? 'Jadwal diperbarui' : 'Jadwal berhasil diterbitkan')
        setIsModalOpen(false)
        setEditingItem(null)
        resetForm()
        await fetchData()
      } else {
        const errorMsg = result.error || 'Gagal menyimpan data'
        const debugInfo = result.details || result.stack || 'No debug info'
        alert(`GAGAL MENERBITKAN JADWAL!\n\nError: ${errorMsg}\nDetail: ${debugInfo}\nStatus: ${res.status}`)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert(`NETWORK ERROR: ${error}`)
      toast.error('Terjadi kesalahan jaringan atau server')
    } finally {
        setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      const res = await fetch(`/api/admin/jadwal/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Jadwal dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus')
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'KHOTIB',
      category: activeTab,
      name: '',
      description: ''
    })
  }

  const openEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: item.type,
      category: item.category,
      name: item.name,
      description: item.description || ''
    })
    setIsModalOpen(true)
  }

  // Effect to reset type if it doesn't match new category in form
  useEffect(() => {
    const validTypes = getTaskTypesByCategory(formData.category)
    if (!validTypes.some(t => t.value === formData.type)) {
      setFormData(prev => ({ ...prev, type: validTypes[0]?.value || '' }))
    }
  }, [formData.category])

  // PDF Generation Function matching the image
  const generatePDF = (targetDate: string) => {
    const doc = new jsPDF()
    const dkmEmerald = [11, 61, 46] // #0b3d2e
    const dkmDarkGreen = [58, 90, 64] // A forest green for the table headers
    
    // Find all tasks for this date in JUMAT category
    const items = data.filter(d => 
      new Date(d.date).toISOString().split('T')[0] === targetDate && 
      d.category === 'JUMAT'
    )

    const dateObj = new Date(targetDate)
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const centerX = pageWidth / 2

    // --- LOGO ---
    try {
      doc.addImage('/logo.png', 'PNG', 20, 10, 20, 20)
    } catch (e) {
      console.error('Failed to load logo in PDF:', e)
      doc.setDrawColor(0)
      doc.circle(30, 20, 10, 'S')
    }

    // --- HEADER ---
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.text('Dewan Kemakmuran Masjid (DKM) Al-Muhajirin', centerX + 10, 18, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Kp. Ragas Grenyang Desa Argawana Kecamatan Puloampel', centerX + 10, 25, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('times', 'italic')
    doc.text('Jadwal Tugas Sholat Jum\'at', centerX, 35, { align: 'center' })

    doc.setLineWidth(0.8)
    doc.line(15, 38, 195, 38)

    // --- DATE ---
    doc.setFont('times', 'normal')
    doc.setFontSize(11)
    doc.text(`Tanggal :        ${formattedDate}`, 30, 48)

    // --- TABLE STRUCTURE ---
    const startY = 55
    const rowHeight = 10
    const labelWidth = 50
    const valueWidth = 115
    
    const tasksToShow = [
      { label: 'Imam Sholat', type: 'IMAM_JUMAT' },
      { label: 'Khotib', type: 'KHOTIB' },
      { label: 'Bilal / Muadzin 1', type: 'BILAL' },
      { label: 'Bilal / Muadzin 2', type: 'ADZAN' },
      { label: 'Iqomah', type: 'IQOMAH' }
    ]

    tasksToShow.forEach((task, i) => {
      const curY = startY + (i * rowHeight)
      
      // Label Background (Dark Green)
      doc.setFillColor(64, 86, 50) // Matching the image's dark green
      doc.rect(15, curY, labelWidth, rowHeight, 'F')
      
      // Label Text
      doc.setTextColor(255)
      doc.setFont('times', 'normal')
      doc.text(task.label, 17, curY + 6.5)
      
      // Value Cell
      doc.setTextColor(0)
      doc.text(':', 15 + labelWidth + 2, curY + 6.5)
      
      // Find the name for this task
      const assigned = items.find(it => it.type === task.type)?.name || '..................................................................'
      doc.text(assigned, 15 + labelWidth + 5, curY + 6.5)
      
      // Underline/Border
      doc.setDrawColor(200)
      doc.setLineWidth(0.1)
      doc.line(15 + labelWidth + 4, curY + 8, 195, curY + 8, 'S')
    })

    // --- SIGNATURE ---
    const sigY = startY + (tasksToShow.length * rowHeight) + 20
    doc.setFont('times', 'normal')
    doc.text('Mengetahui,', 160, sigY, { align: 'center' })
    doc.text('Ketua DKM Al-Muhajirin', 160, sigY + 5, { align: 'center' })
    
    doc.setFont('times', 'bold')
    doc.text('H. Agung Gunawan', 160, sigY + 25, { align: 'center' })
    doc.setLineWidth(0.2)
    doc.line(140, sigY + 26, 180, sigY + 26)

    doc.save(`Jadwal_Jumat_${targetDate}.pdf`)
  }

  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                      item.type.toLowerCase().includes(search.toLowerCase())
    const matchTab = item.category === activeTab
    return matchSearch && matchTab
  })

  const categories = [
    { value: 'JUMAT', label: "Sholat Jum'at" },
    { value: 'TARAWIH', label: 'Sholat Tarawih' },
    { value: 'IDUL_FITRI', label: 'Sholat Idul Fitri' },
    { value: 'IDUL_ADHA', label: 'Sholat Idul Adha' }
  ]

  // Task types mapped to categories
  const getTaskTypesByCategory = (cat: string) => {
    switch(cat) {
      case 'JUMAT':
        return [
          { value: 'IMAM_JUMAT', label: 'Imam Sholat Jum\'at' },
          { value: 'KHOTIB', label: 'Khotib' },
          { value: 'BILAL', label: 'Bilal' },
          { value: 'ADZAN', label: 'Adzan' },
          { value: 'IQOMAH', label: 'Iqomah' }
        ]
      case 'TARAWIH':
        return [
          { value: 'IMAM_TARAWIH', label: 'Imam Tarawih' },
          { value: 'BILAL_1', label: 'Bilal 1' },
          { value: 'BILAL_2', label: 'Bilal 2' },
          { value: 'KAMILIN', label: 'Kamilin' },
          { value: 'DOA_WITIR', label: 'Do\'a Witir' }
        ]
      case 'IDUL_FITRI':
      case 'IDUL_ADHA':
        return [
          { value: 'IMAM', label: 'Imam' },
          { value: 'KHOTIB', label: 'Khotib' },
          { value: 'BILAL', label: 'Bilal' },
          { value: 'IQOMAH', label: 'Iqomah' }
        ]
      default:
        return []
    }
  }

  // Flattened labels for table display
  const allTaskTypes = [
    ...getTaskTypesByCategory('JUMAT'),
    ...getTaskTypesByCategory('TARAWIH'),
    ...getTaskTypesByCategory('IDUL_FITRI'),
    ...getTaskTypesByCategory('IDUL_ADHA')
  ].reduce((acc: any[], current) => {
    const x = acc.find(item => item.value === current.value);
    if (!x) return acc.concat([current]);
    return acc;
  }, []);

  return (
    <AdminLayout title="Jadwal Tugas" subtitle="Kelola penugasan imam, khotib, dan petugas operasional masjid.">
      <div className="p-6 md:p-10 space-y-8">


        {/* Actions & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex bg-white p-1.5 rounded-3xl border border-neutral-100 shadow-sm overflow-x-auto w-full lg:w-auto">
             {categories.map(cat => {
               const count = data.filter(d => d.category === cat.value).length
               return (
               <button 
                 key={cat.value}
                 onClick={() => setActiveTab(cat.value)}
                 className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === cat.value ? 'bg-[#0b3d2e] text-white' : 'text-neutral-400 hover:text-[#0b3d2e]'}`}
               >
                 {cat.label}
                 {count > 0 && (
                   <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${activeTab === cat.value ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                     {count}
                   </span>
                 )}
               </button>
             )})}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <Input 
                placeholder="Cari nama petugas..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl border-neutral-100 bg-white"
              />
            </div>
            
            {canCreate && (
            <Dialog open={isModalOpen} onOpenChange={(open) => {
              setIsModalOpen(open)
              if (!open) {
                setEditingItem(null)
                resetForm()
              }
            }}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl bg-[#0b3d2e] hover:bg-[#062c21] font-black uppercase tracking-widest text-xs">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#0b3d2e] p-8 text-white">
                  <DialogTitle className="text-2xl font-black">{editingItem ? 'Edit Jadwal Tugas' : 'Tambah Jadwal Tugas'}</DialogTitle>
                  <p className="text-emerald-100/60 text-xs mt-1 italic font-medium">Input penugasan rutin atau khusus DKM.</p>
                </div>
                <form id="jadwal-form" onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tanggal</Label>
                       <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-12 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Kategori</Label>
                       <Select 
                        value={formData.category} 
                        onValueChange={v => setFormData({...formData, category: v})}
                       >
                         <SelectTrigger className="h-12 rounded-xl">
                           <SelectValue placeholder="Pilih Kategori" />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl">
                           {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                         </SelectContent>
                       </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Jenis Tugas</Label>
                     <Select 
                      value={formData.type} 
                      onValueChange={v => setFormData({...formData, type: v})}
                     >
                       <SelectTrigger className="h-12 rounded-xl font-bold">
                         <SelectValue placeholder="Pilih Tugas" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                         {getTaskTypesByCategory(formData.category).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                       </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nama Petugas</Label>
                     <Input 
                      placeholder="Masukkan nama petugas..." 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="h-12 rounded-xl font-bold text-emerald-700"
                      required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Keterangan (Opsional)</Label>
                     <Input 
                      placeholder="Tambahan detail tugas..." 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="h-12 rounded-xl"
                     />
                  </div>

                  <DialogFooter className="pt-4">
                    <Button 
                      form="jadwal-form"
                      type="submit" 
                      disabled={loading}
                      className="w-full h-14 rounded-2xl bg-[#0b3d2e] hover:bg-[#062c21] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-900/10"
                    >
                      {loading ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Terbitkan Jadwal')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        {/* Schedule List */}
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-neutral-200/50 overflow-hidden bg-white">
          <CardHeader className="p-10 border-b border-neutral-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-slate-900">
                Daftar Penugasan 
              </CardTitle>
              <p className="text-xs text-neutral-400 mt-1 italic font-medium">Monitoring tugas aktif masjid.</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="rounded-xl border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50">
                Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0b3d2e] border-t-transparent shadow-sm"></div>
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Menyelaraskan Data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-20 text-center">
                 <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-neutral-200" />
                 </div>
                 <p className="text-lg font-bold text-neutral-300 italic">
                    {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada jadwal di kategori ini'}
                 </p>
                 {!search && (
                    <button className="text-emerald-600 text-xs font-black uppercase mt-2 tracking-widest hover:underline" onClick={() => { setIsModalOpen(true); resetForm(); }}>
                        + Buat Jadwal Baru
                    </button>
                 )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50/50">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Petugas</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Jenis Tugas</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Waktu / Tanggal</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50/50">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/20 transition-all group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                                 <UserIcon className="h-6 w-6" />
                              </div>
                              <div>
                                 <span className="font-black text-slate-900 block uppercase tracking-tight">{item.name}</span>
                                 <Badge className="mt-1 bg-white border border-neutral-100 text-neutral-400 text-[10px] font-bold py-0 h-5 px-2 rounded-lg">
                                    {categories.find(c => c.value === item.category)?.label || item.category}
                                 </Badge>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                          <Badge className={`rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none ${
                            item.type === 'KHOTIB' ? 'bg-orange-50 text-orange-600' :
                            item.type.includes('IMAM') ? 'bg-indigo-50 text-indigo-600' :
                            item.type === 'ADZAN' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {allTaskTypes.find(t => t.value === item.type)?.label || item.type}
                          </Badge>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-[#0b3d2e]">
                                {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-medium italic mt-0.5">{item.description || 'Tanpa keterangan tambahan'}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex justify-end gap-2">
                              {item.category === 'JUMAT' && (
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-emerald-600 hover:bg-emerald-50" onClick={() => generatePDF(new Date(item.date).toISOString().split('T')[0])}>
                                   <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {canUpdate && (
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-blue-500 hover:bg-blue-50" onClick={() => openEdit(item)}>
                                   <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                                   <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
    </AdminLayout>
  )
}
