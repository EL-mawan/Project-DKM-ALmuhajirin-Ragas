'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Search, Edit2, Trash2, Globe, Lock, Eye, Newspaper } from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function BeritaAdmin() {
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Berita',
    status: 'draft',
    image: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/berita')
      const data = await res.json()
      setArticles(data || [])
    } catch (error) {
      toast.error('Gagal mengambil data berita')
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
      const url = editingArticle ? `/api/admin/berita/${editingArticle.id}` : '/api/admin/berita'
      const method = editingArticle ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingArticle ? 'Artikel diperbarui' : 'Artikel diterbitkan')
        setIsModalOpen(false)
        setEditingArticle(null)
        setFormData({ title: '', content: '', category: 'Berita', status: 'draft', image: '' })
        fetchData()
      } else {
        toast.error('Gagal menyimpan artikel')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return
    try {
      const res = await fetch(`/api/admin/berita/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Artikel dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus berita')
    }
  }

  const filteredArticles = articles.filter((a: any) => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Berita & Artikel" subtitle="Kelola publikasi informasi dan dakwah umat.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Publikasi</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Kelola konten berita dan edukasi islami.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setEditingArticle(null)
              setFormData({ title: '', content: '', category: 'Berita', status: 'draft', image: '' })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Tulis Artikel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                  {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Judul Artikel</Label>
                    <Input 
                      required 
                      placeholder="Masukkan judul menarik..."
                      className="rounded-xl h-12 text-lg font-bold"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="Berita">Berita Utama</SelectItem>
                          <SelectItem value="Kegiatan">Info Kegiatan</SelectItem>
                          <SelectItem value="Dakwah">Dakwah & Edukasi</SelectItem>
                          <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={val => setFormData({...formData, status: val})}
                      >
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="draft">Draf (Privat)</SelectItem>
                          <SelectItem value="published">Terbit (Publik)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL Gambar (Opsional)</Label>
                    <Input 
                      placeholder="https://..." 
                      className="rounded-xl h-12"
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Konten Artikel</Label>
                    <Textarea 
                      required 
                      placeholder="Tulis isi artikel di sini..."
                      className="rounded-xl min-h-[200px] leading-relaxed"
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-2xl py-6 font-bold mt-4">
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Daftar Terbitan</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari judul..." 
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
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-24">
                <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Newspaper className="h-10 w-10 text-neutral-300" />
                </div>
                <p className="text-muted-foreground">Belum ada artikel yang ditulis.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Artikel</th>
                      <th className="px-8 py-5">Kategori</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredArticles.map((article: any) => (
                      <tr key={article.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-[#0b3d2e] max-w-md line-clamp-1">{article.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">
                            Dibuat pada {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                            {article.category}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${article.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {article.status === 'published' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                            {article.status === 'published' ? 'Terbit' : 'Draf'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 hover:bg-primary/5 hover:text-primary"
                              onClick={() => {
                                setEditingArticle(article)
                                setFormData({
                                  title: article.title,
                                  content: article.content,
                                  category: article.category,
                                  status: article.status,
                                  image: article.image || ''
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
                              onClick={() => handleDelete(article.id)}
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
