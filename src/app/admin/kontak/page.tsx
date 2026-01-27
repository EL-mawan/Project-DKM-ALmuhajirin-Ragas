'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Trash2, 
  MessageSquare,
  Mail,
  User,
  Clock
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/admin-layout'

export default function KontakAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/kontak')
      const json = await res.json()
      setData(json || [])
    } catch (error) {
      toast.error('Gagal mengambil data pesan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini?')) return
    try {
      const res = await fetch(`/api/admin/kontak/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Pesan dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus pesan')
    }
  }

  const filteredData = data.filter((item: any) => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.subject.toLowerCase().includes(search.toLowerCase()) ||
    item.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Kontak Masuk" subtitle="Daftar aspirasi dan pesan dari jamaah.">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Pesan & Aspirasi</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Total {filteredData.length} pesan masuk.</p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Inbox Pesan</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari pengirim atau isi..." 
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
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">Tidak ada pesan masuk.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Pengirim</th>
                      <th className="px-8 py-5">Isi Pesan</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-[#0b3d2e]">{item.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {item.email}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-1 flex items-center font-bold">
                            <Clock className="h-2.5 w-2.5 mr-1" /> {new Date(item.createdAt).toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="font-bold text-sm text-neutral-700">{item.subject}</div>
                           <p className="text-xs text-neutral-500 line-clamp-2 mt-1 max-w-xl">{item.message}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl h-10 w-10 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
