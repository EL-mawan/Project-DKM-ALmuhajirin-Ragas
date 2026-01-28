'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Calendar,
  MapPin,
  Clock,
  Filter,
  Loader2
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { StatusPopup } from '@/components/ui/status-popup'
import { useStatusPopup } from '@/lib/hooks/use-status-popup'

interface Kegiatan {
  id: string
  title: string
  category: string
  description: string
  date: string
  location: string
  status: string
  createdAt: string
}

import { AdminLayout } from '@/components/layout/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function KegiatanAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Kegiatan[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Kegiatan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { statusProps, showSuccess, showError } = useStatusPopup()

  const [formData, setFormData] = useState<any>({
    title: '',
    category: 'PHBI',
    description: '',
    date: '',
    location: '',
    // PHBI specific
    memperingati: '',
    // Pengajian specific
    setiapHari: 'Senin',
    waktu: '',
    pemateri: [''],
    kitab: '',
    // Pendidikan specific
    materi: '',
    target: '',
  })

  const getDynamicLabel = (cat: string) => {
    switch (cat) {
      case 'PHBI': return 'Nama Penceramah / Pengisi'
      case 'Pengajian Rutin': return 'Kitab / Materi Pembahasan'
      case 'Pendidikan': return 'Target Peserta / Jenjang'
      default: return 'Keterangan Tambahan'
    }
  }

  const getDynamicPlaceholder = (cat: string) => {
    switch (cat) {
      case 'PHBI': return 'Contoh: KH. Zainuddin MZ'
      case 'Pengajian Rutin': return 'Contoh: Kitab Riyadhus Shalihin'
      case 'Pendidikan': return 'Contoh: Remaja Masjid / Anak-anak'
      default: return 'Contoh: Membawa perlengkapan sholat'
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/kegiatan')
      const json = await res.json()
      setData(json.data || [])
    } catch (error) {
      toast.error('Gagal mengambil data kegiatan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const url = editingItem ? `/api/admin/kegiatan/${editingItem.id}` : '/api/admin/kegiatan'
      const method = editingItem ? 'PATCH' : 'POST'

      // Construct dynamic description or content based on category
      let finalTitle = formData.title
      let finalDate = formData.date
      let finalDescription = formData.description

      if (formData.category === 'PHBI') {
        finalTitle = `PHBI: ${formData.memperingati}`
      } else if (formData.category === 'Pengajian Rutin') {
        finalTitle = `Pengajian: ${formData.kitab}`
        finalDescription = `Pemateri: ${formData.pemateri.filter((p: string) => p).join(', ')}\nJadwal: Setiap ${formData.setiapHari} Pukul ${formData.waktu}\n\n${formData.description}`
      } else if (formData.category === 'Pendidikan') {
        finalTitle = `Pendidikan: ${formData.materi}`
        finalDescription = `Pemateri: ${formData.pemateri[0] || '-'}\nTarget: ${formData.target}\n\n${formData.description}`
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          category: formData.category,
          description: finalDescription,
          date: finalDate,
          location: formData.location,
          status: 'approved'
        })
      })

      if (res.ok) {
        showSuccess(
          editingItem ? 'Agenda Diperbarui' : 'Agenda Ditambahkan',
          editingItem ? 'Jadwal kegiatan masjid telah berhasil dimodifikasi.' : 'Kegiatan baru telah berhasil dijadwalkan di kalender DKM.'
        )
        setIsModalOpen(false)
        setEditingItem(null)
        resetForm()
        fetchData()
      } else {
        const err = await res.json()
        showError('Gagal Menyimpan', err.error || 'Server Neon sedang mengalami gangguan koneksi.')
      }
    } catch (error) {
      showError('Kesalahan Pemuatan', 'Maaf, sistem tidak dapat memproses agenda saat ini.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      category: 'PHBI',
      description: '',
      date: '',
      location: '',
      memperingati: '',
      setiapHari: 'Senin',
      waktu: '',
      pemateri: [''],
      kitab: '',
      materi: '',
      target: '',
    })
  }

  const addPemateri = () => {
    setFormData({ ...formData, pemateri: [...formData.pemateri, ''] })
  }

  const updatePemateri = (index: number, value: string) => {
    const newPemateri = [...formData.pemateri]
    newPemateri[index] = value
    setFormData({ ...formData, pemateri: newPemateri })
  }

  const removePemateri = (index: number) => {
    if (formData.pemateri.length > 1) {
      const newPemateri = formData.pemateri.filter((_: any, i: number) => i !== index)
      setFormData({ ...formData, pemateri: newPemateri })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return
    try {
      const res = await fetch(`/api/admin/kegiatan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showSuccess('Kegiatan Dibatalkan', 'Agenda telah dihapus secara permanen dari sistem.')
        fetchData()
      }
    } catch (error) {
      showError('Gagal Menghapus', 'Agenda gagal dihapus karena kendala jaringan.')
    }
  }

  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Manajemen Kegiatan" subtitle="Kelola seluruh agenda dan kegiatan Masjid Jami' Al-Muhajirin.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Daftar Agenda</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Total {filteredData.length} kegiatan terdaftar.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setEditingItem(null)
              setFormData({ title: '', category: 'PHBI', description: '', date: '', location: '', specificDetail: '' })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kegiatan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                  {editingItem ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Kategori Kegiatan*</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={val => setFormData({...formData, category: val})}
                    >
                      <SelectTrigger className="rounded-xl h-12 border-emerald-100">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="PHBI">PHBI (Peringatan Hari Besar)</SelectItem>
                        <SelectItem value="Pengajian Rutin">Pengajian Rutin</SelectItem>
                        <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.category === 'PHBI' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Memperingati*</label>
                        <Input 
                          required 
                          placeholder="Misal: Isra Mi'raj 1445H"
                          className="rounded-xl h-12"
                          value={formData.memperingati}
                          onChange={e => setFormData({...formData, memperingati: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {formData.category === 'Pengajian Rutin' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Setiap Hari*</label>
                          <Select 
                            value={formData.setiapHari} 
                            onValueChange={val => setFormData({...formData, setiapHari: val})}
                          >
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue placeholder="Pilih Hari" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Waktu / Jam*</label>
                          <Input 
                            required 
                            placeholder="Misal: 19:30 WIB"
                            className="rounded-xl h-12"
                            value={formData.waktu}
                            onChange={e => setFormData({...formData, waktu: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Kitab / Materi*</label>
                         <Input 
                           required 
                           placeholder="Misal: Safinatun Najah"
                           className="rounded-xl h-12"
                           value={formData.kitab}
                           onChange={e => setFormData({...formData, kitab: e.target.value})}
                         />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Nama-nama Pemateri</label>
                          <Button type="button" variant="ghost" size="sm" onClick={addPemateri} className="h-7 text-[10px] text-emerald-600 font-bold">
                            <Plus className="h-3 w-3 mr-1" /> Tambah Pemateri
                          </Button>
                        </div>
                        {formData.pemateri.map((p: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <Input 
                              placeholder={`Pemateri ${i+1}`}
                              className="rounded-xl h-11"
                              value={p}
                              onChange={e => updatePemateri(i, e.target.value)}
                            />
                            {formData.pemateri.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removePemateri(i)} className="text-rose-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.category === 'Pendidikan' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Materi Pendidikan*</label>
                        <Input 
                          required 
                          placeholder="Misal: Kursus Bahasa Arab"
                          className="rounded-xl h-12"
                          value={formData.materi}
                          onChange={e => setFormData({...formData, materi: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Nama Pemateri*</label>
                          <Input 
                            required 
                            placeholder="Ustadz ..."
                            className="rounded-xl h-12"
                            value={formData.pemateri[0]}
                            onChange={e => updatePemateri(0, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Target Peserta*</label>
                           <Input 
                             required 
                             placeholder="Misal: Remaja / Anak-anak"
                             className="rounded-xl h-12"
                             value={formData.target}
                             onChange={e => setFormData({...formData, target: e.target.value})}
                           />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.category === 'Lainnya' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Nama Kegiatan*</label>
                      <Input 
                        required 
                        className="rounded-xl h-12"
                        placeholder="Masukkan nama kegiatan..." 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                  )}

                  {(formData.category !== 'Pengajian Rutin') && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Waktu Peringatan / Pelaksanaan*</label>
                      <Input 
                        required 
                        type="datetime-local" 
                        className="rounded-xl h-12"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Lokasi Kegiatan*</label>
                    <Input 
                      required 
                      className="rounded-xl h-12"
                      placeholder="Contoh: Aula Masjid / Teras Masjid" 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0b3d2e]/60">Deskripsi / Detail Acara*</label>
                    <textarea 
                      required 
                      className="w-full min-h-[100px] rounded-2xl border border-emerald-50 bg-neutral-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Berikan detail tambahan mengenai kegiatan..." 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-4xl py-8 font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/10 text-white bg-[#0b3d2e] hover:bg-[#062c21]"
                >
                  {isSubmitting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                  {isSubmitting ? 'Memproses...' : (editingItem ? 'Simpan Perubahan' : 'Terbitkan Kegiatan')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-gray-200/50 overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Agenda Masjid</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari kegiatan atau kategori..." 
                  className="pl-10 rounded-full bg-gray-50/50 border-gray-100 focus:bg-white transition-all h-12"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
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
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-lg font-medium text-gray-400">Tidak ada data kegiatan ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                      <th className="px-8 py-5">Nama Kegiatan</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5 hidden md:table-cell">Waktu & Lokasi</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-[#0b3d2e]">{item.title}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-1 uppercase font-bold tracking-widest md:hidden">
                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {item.location}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1 hidden md:block">{item.description}</div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className="rounded-full px-3 py-1 font-bold tracking-wider text-[9px] uppercase bg-primary/5 text-primary border-primary/10">
                            {item.category || 'Lainnya'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center text-xs text-gray-600 font-medium">
                              <Calendar className="h-3 w-3 mr-2 text-primary" />
                              {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center text-xs text-gray-600 font-medium">
                              <MapPin className="h-3 w-3 mr-2 text-primary" />
                              {item.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-primary/5 hover:text-primary h-10 w-10"
                              onClick={() => {
                                setEditingItem(item)
                                // Parse specific info from description if it exists
                                const detailMatch = item.description.match(/^\[(.*?): (.*?)\] (.*)$/)
                                setFormData({
                                  title: item.title,
                                  category: item.category || 'PHBI',
                                  specificDetail: detailMatch ? detailMatch[2] : '',
                                  description: detailMatch ? detailMatch[3] : item.description,
                                  date: new Date(item.date).toISOString().slice(0, 16),
                                  location: item.location
                                })
                                setIsModalOpen(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl hover:bg-rose-50 hover:text-rose-600 h-10 w-10 text-rose-400"
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
