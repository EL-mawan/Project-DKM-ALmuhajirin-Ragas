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
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusPopup } from '@/components/ui/status-popup'
import { useStatusPopup } from '@/lib/hooks/use-status-popup'

export default function JamaahAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('kk')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { statusProps, showSuccess, showError } = useStatusPopup()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    nomor: '',
    blok: '',
    rt: '',
    rw: '',
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

  // Helper untuk navigasi Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      if (e.target.type === 'submit') return;
      
      e.preventDefault();
      const form = e.target.form;
      if (!form) return;
      
      const index = Array.prototype.indexOf.call(form, e.target);
      const nextElement = form.elements[index + 1] as HTMLElement;
      
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
      nomor: '', blok: '', rt: '', rw: '', keterangan: '',
      birthDate: '', education: '', skills: ''
    })
  }

  const filteredData = (Array.isArray(data) ? data : []).filter((item: any) => 
    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (activeTab === 'kk' ? item?.blok?.toLowerCase() : item?.address?.toLowerCase())?.includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Data Jamaah" subtitle="Kelola database warga & remaja Masjid.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={activeTab} className="w-full md:w-auto" onValueChange={(val) => setActiveTab(val)}>
            <TabsList className="bg-white border rounded-2xl p-1 h-12 shadow-sm">
              <TabsTrigger value="kk" className="rounded-xl px-6 font-bold">Kepala Keluarga</TabsTrigger>
              <TabsTrigger value="remaja" className="rounded-xl px-6 font-bold">Remaja Masjid</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
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
                        <Label>Nomor* (ID/Urutan)</Label>
                        <Input 
                          required
                          className="rounded-xl h-12"
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
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>RT</Label>
                          <Input 
                            className="rounded-xl h-12"
                            value={formData.rt}
                            onChange={e => setFormData({...formData, rt: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>RW</Label>
                          <Input 
                            className="rounded-xl h-12"
                            value={formData.rw}
                            onChange={e => setFormData({...formData, rw: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
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

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">
                {activeTab === 'kk' ? 'Data Kepala Keluarga' : 'Data Remaja Masjid'}
              </CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={`Cari nama atau ${activeTab === 'kk' ? 'blok' : 'pendidikan'}...`}
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
                <Users className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Belum ada data jamaah.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Nama & Detail</th>
                      <th className="px-8 py-5">Lokasi / Alamat</th>
                      <th className="px-8 py-5">Info Lain</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-[#0b3d2e]">{item.name}</div>
                          {activeTab === 'kk' ? (
                            <div className="text-[10px] font-bold text-primary mt-0.5">NOMOR: {item.nomor}</div>
                          ) : (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
                              <GraduationCap className="h-3 w-3 mr-1" /> {item.education || '-'}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs text-neutral-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-primary shrink-0" /> 
                            <span className="line-clamp-1">{activeTab === 'kk' ? item.blok : item.address}</span>
                          </div>
                          {item.phone && (
                            <div className="text-xs text-neutral-400 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-primary shrink-0" /> {item.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {activeTab === 'kk' ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-neutral-50 border-emerald-100">RT {item.rt}</Badge>
                                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-neutral-50 border-emerald-100">RW {item.rw}</Badge>
                              </div>
                              {item.keterangan && <div className="text-[10px] text-muted-foreground italic">"{item.keterangan}"</div>}
                            </div>
                          ) : (
                            <div className="text-xs font-medium text-neutral-500 line-clamp-1">
                              {item.skills || 'Tidak ada info skill'}
                            </div>
                          )}
                        </td>
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
                                  rt: item.rt || '',
                                  rw: item.rw || '',
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
