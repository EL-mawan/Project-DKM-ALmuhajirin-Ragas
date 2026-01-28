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
  Heart,
  User,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function DhuafaAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nomor: '',
    name: '',
    type: 'fakir_miskin',
    address: '',
    phone: '',
    nik: '',
    keterangan: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dhuafa')
      const json = await res.json()
      if (res.ok) {
        setData(Array.isArray(json) ? json : [])
      } else {
        setData([])
        toast.error(json.error || 'Gagal mengambil data')
      }
    } catch (error) {
      setData([])
      toast.error('Gagal mengambil data')
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
      const url = editingItem ? `/api/admin/dhuafa/${editingItem.id}` : '/api/admin/dhuafa'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingItem ? 'Data diperbarui' : 'Data berhasil ditambahkan')
        setIsModalOpen(false)
        setEditingItem(null)
        resetForm()
        fetchData()

        // Auto redirect to Neon DBMS for verification
        setTimeout(() => {
          window.open('https://console.neon.tech/app/projects/holy-flower-a1alhjqe/tables', '_blank')
        }, 1000)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal menyimpan data')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return
    try {
      const res = await fetch(`/api/admin/dhuafa/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Dihapus')
        fetchData()

        // Auto redirect to Neon DBMS for verification
        setTimeout(() => {
          window.open('https://console.neon.tech/app/projects/holy-flower-a1alhjqe/tables', '_blank')
        }, 1000)
      }
    } catch (error) {
      toast.error('Gagal menghapus')
    }
  }

  const resetForm = () => {
    setFormData({ nomor: '', name: '', type: 'fakir_miskin', address: '', phone: '', nik: '', keterangan: '' })
  }

  const filteredData = (Array.isArray(data) ? data : []).filter((item: any) => 
    item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item?.nomor?.includes(search)
  )

  const getTypeName = (type: string) => {
    const types: any = {
      janda: 'Janda',
      guru_ngaji: 'Guru Ngaji',
      fakir_miskin: 'Fakir Miskin',
      yatim: 'Yatim',
      yatim_piatu: 'Yatim Piatu',
      fisabilillah: 'Fisabilillah'
    }
    return types[type] || type
  }

  return (
    <AdminLayout title="Kaum Dhuafa" subtitle="Kelola program bantuan & database penerima manfaat.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Penerima Bantuan</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Total {filteredData.length} penerima terdaftar.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setEditingItem(null)
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Penerima
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                  {editingItem ? 'Edit Data Dhuafa' : 'Tambah Penerima Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nomor</Label>
                    <Input 
                      className="rounded-xl h-12"
                      placeholder="Contoh: 001"
                      value={formData.nomor}
                      onChange={e => setFormData({...formData, nomor: e.target.value})}
                    />
                  </div>
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
                    <Label>Kategori*</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={val => setFormData({...formData, type: val})}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="fakir_miskin">Fakir Miskin</SelectItem>
                        <SelectItem value="yatim">Yatim</SelectItem>
                        <SelectItem value="yatim_piatu">Yatim Piatu</SelectItem>
                        <SelectItem value="janda">Janda</SelectItem>
                        <SelectItem value="guru_ngaji">Guru Ngaji</SelectItem>
                        <SelectItem value="fisabilillah">Fisabilillah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon</Label>
                    <Input 
                      className="rounded-xl h-12"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Keterangan</Label>
                  <Textarea 
                    className="rounded-xl min-h-[100px]"
                    placeholder="Contoh: Sangat membutuhkan bantuan rutin..."
                    value={formData.keterangan}
                    onChange={e => setFormData({...formData, keterangan: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alamat (Opsional)</Label>
                  <Input 
                    className="rounded-xl h-12"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl py-6 font-bold mt-4 shadow-lg shadow-primary/20"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isSubmitting ? 'Memproses...' : (editingItem ? 'Simpan Perubahan' : 'Daftarkan Penerima')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Database Penerima</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama atau nomor..." 
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
                <Heart className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Belum ada data dhuafa.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Nomor & Nama</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5">Keterangan</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">NO: {item.nomor || '-'}</div>
                          <div className="font-bold text-[#0b3d2e]">{item.name}</div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider bg-rose-50 text-rose-600 border-rose-100">
                            {getTypeName(item.type)}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs text-neutral-500 line-clamp-2 max-w-xs italic">
                            {item.keterangan ? `"${item.keterangan}"` : '-'}
                          </div>
                          {item.address && (
                            <div className="text-[9px] text-muted-foreground mt-1 flex items-center capitalize">
                              <MapPin className="h-2 w-2 mr-1" /> {item.address}
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
                                  nomor: item.nomor || '',
                                  name: item.name,
                                  type: item.type,
                                  address: item.address || '',
                                  phone: item.phone || '',
                                  nik: item.nik || '',
                                  keterangan: item.keterangan || ''
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
    </AdminLayout>
  )
}
