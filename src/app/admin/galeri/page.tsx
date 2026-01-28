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
  Image as ImageIcon,
  ExternalLink,
  Film,
  Camera,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function GaleriAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'image',
    category: 'Kegiatan'
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/galeri')
      const json = await res.json()
      setData(json || [])
    } catch (error) {
      toast.error('Gagal mengambil data galeri')
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
      const url = editingItem ? `/api/admin/galeri/${editingItem.id}` : '/api/admin/galeri'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingItem ? 'Media diperbarui' : 'Media berhasil ditambahkan')
        setIsModalOpen(false)
        resetForm()
        fetchData()
      } else {
        toast.error('Gagal menyimpan media')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({ title: '', url: '', type: 'image', category: 'Kegiatan' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus media ini?')) return
    try {
      const res = await fetch(`/api/admin/galeri/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Media dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus media')
    }
  }

  const filteredData = data.filter((item: any) => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Galeri Dokumentasi" subtitle="Kelola arsip foto dan video kegiatan masjid.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Media Library</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Total {filteredData.length} item dokumentasi.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                  {editingItem ? 'Edit Media' : 'Tambah Media Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Judul / Keterangan Media</Label>
                    <Input 
                      required 
                      className="rounded-xl h-12"
                      placeholder="Contoh: Dokumentasi Idul Fitri 1445H"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Media (Image/Video)</Label>
                    <Input 
                      required 
                      className="rounded-xl h-12"
                      placeholder="https://..."
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipe Media</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={val => setFormData({...formData, type: val})}
                      >
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="image">Foto (Image)</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={val => setFormData({...formData, category: val})}
                      >
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                          <SelectItem value="Pembangunan">Pembangunan</SelectItem>
                          <SelectItem value="Sosial">Bakti Sosial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl py-6 font-bold mt-4 shadow-lg shadow-primary/20"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isSubmitting ? 'Memproses...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Media')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Arsip Dokumentasi</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari media..." 
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
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Belum ada media di galeri.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Preview & Judul</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5">Tipe</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                              {item.type === 'image' || item.type === 'foto' ? (
                                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/100x100?text=Error'} />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center"><Film className="h-5 w-5 text-neutral-400" /></div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#0b3d2e]">{item.title}</div>
                              <div className="text-[10px] text-muted-foreground flex items-center mt-0.5">
                                <ExternalLink className="h-2.5 w-2.5 mr-1" />
                                <a href={item.imageUrl} target="_blank" rel="noreferrer" className="hover:underline line-clamp-1">{item.imageUrl}</a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">{item.category}</Badge>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center text-xs font-bold text-neutral-500 uppercase tracking-tighter">
                             {item.type === 'image' ? <Camera className="h-3 w-3 mr-1" /> : <Film className="h-3 w-3 mr-1" />}
                             {item.type}
                           </div>
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
                                  title: item.title,
                                  url: item.imageUrl,
                                  type: item.type,
                                  category: item.category
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
