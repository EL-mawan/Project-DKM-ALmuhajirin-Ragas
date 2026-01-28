'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Trash2, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar,
  Layers,
  Edit2,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatCurrency } from '@/lib/utils'

export default function KeuanganAdmin() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({ income: { data: [] }, expense: { data: [] } })
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('income')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: 'income',
    date: new Date().toISOString().slice(0, 16),
    // Pemasukan
    source: '',
    sourceUnit: '',
    qty: '1',
    unitPrice: '',
    amount: '0',
    // Pengeluaran
    itemName: '',
    unitType: '',
    category: '',
    description: '',
  })

  // Auto-calculate total amount
  useEffect(() => {
    const q = parseFloat(formData.qty) || 0
    const p = parseFloat(formData.unitPrice || '0') || parseFloat(formData.amount || '0')
    if (formData.unitPrice) {
      setFormData(prev => ({ ...prev, amount: (q * p).toString() }))
    }
  }, [formData.qty, formData.unitPrice])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/keuangan?type=all')
      const json = await res.json()
      setData(json)
    } catch (error) {
      toast.error('Gagal mengambil data keuangan')
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
      const url = editingItem ? `/api/admin/keuangan/${editingItem.id}` : '/api/admin/keuangan'
      const method = editingItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingItem ? 'Transaksi diperbarui' : 'Transaksi berhasil dicatat')
        setIsModalOpen(false)
        resetForm()
        fetchData()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal menyimpan transaksi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      type: formData.type,
      date: new Date().toISOString().slice(0, 16),
      source: '',
      sourceUnit: '',
      qty: '1',
      unitPrice: '',
      amount: '0',
      itemName: '',
      unitType: '',
      category: '',
      description: '',
    })
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      type: item.txType,
      date: new Date(item.date).toISOString().slice(0, 16),
      source: item.source || '',
      sourceUnit: item.sourceUnit || '',
      qty: item.qty?.toString() || '1',
      unitPrice: item.unitPrice?.toString() || '',
      amount: item.amount.toString(),
      itemName: item.itemName || '',
      unitType: item.unitType || '',
      category: item.category || '',
      description: item.description || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    try {
      const res = await fetch(`/api/admin/keuangan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Transaksi dihapus')
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal menghapus transaksi')
    }
  }

  const allTransactions = [
    ...(data.income?.data || []).map((i: any) => ({ ...i, txType: 'income' })),
    ...(data.expense?.data || []).map((e: any) => ({ ...e, txType: 'expense' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = allTransactions.filter((tx: any) => 
    (activeTab === 'all' || tx.txType === activeTab) &&
    (tx.description?.toLowerCase().includes(search.toLowerCase()) || 
     tx.source?.toLowerCase().includes(search.toLowerCase()) ||
     tx.itemName?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AdminLayout title="Lalu Lintas Keuangan" subtitle="Kelola arus kas masuk dan keluar Masjid.">
      <div className="p-6 sm:p-8 space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-emerald-50/50">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Pemasukan</p>
              <h3 className="text-3xl font-black text-[#0b3d2e] mt-1">{formatCurrency(data.income?.total || 0)}</h3>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-rose-50/50">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Total Pengeluaran</p>
              <h3 className="text-3xl font-black text-[#0b3d2e] mt-1">{formatCurrency(data.expense?.total || 0)}</h3>
            </CardContent>
          </Card>
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-indigo-50/50">
            <CardContent className="p-8">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Saldo Akhir</p>
              <h3 className="text-3xl font-black text-[#0b3d2e] mt-1">{formatCurrency(data.balance || 0)}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs defaultValue="income" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-white border-none rounded-2xl p-1.5 h-14 shadow-sm">
              <TabsTrigger value="all" className="rounded-xl px-8 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden md:flex">Semua</TabsTrigger>
              <TabsTrigger value="income" className="rounded-xl px-8 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Pemasukan</TabsTrigger>
              <TabsTrigger value="expense" className="rounded-xl px-8 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Pengeluaran</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl shadow-xl shadow-emerald-900/10 h-14 px-10 font-bold w-full md:w-auto bg-[#0b3d2e] hover:bg-[#062c21] text-white">
                <Plus className="h-5 w-5 mr-2" />
                Catat Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-[40px] shadow-2xl">
              <div className="p-8 bg-[#0b3d2e] text-white">
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {editingItem ? 'Edit Transaksi' : 'Input Transaksi Baru'}
                </DialogTitle>
                <p className="text-emerald-100/60 text-xs mt-1">
                  {editingItem ? 'Perbarui rincian transaksi kas masjid.' : 'Lengkapi rincian keuangan masjid dengan teliti.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-[1.5rem]">
                  <button 
                    type="button"
                    className={cn("py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", formData.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-400")}
                    onClick={() => setFormData({...formData, type: 'income'})}
                  >
                    Pemasukan
                  </button>
                  <button 
                    type="button"
                    className={cn("py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", formData.type === 'expense' ? "bg-white text-rose-600 shadow-sm" : "text-neutral-400")}
                    onClick={() => setFormData({...formData, type: 'expense'})}
                  >
                    Pengeluaran
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Common: Date */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tanggal Transaksi</Label>
                    <div className="relative">
                      <Input 
                        required 
                        type="datetime-local" 
                        className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  {formData.type === 'income' ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sumber Dana</Label>
                        <Input 
                          required 
                          placeholder="Kotak Amal, Donatur, dll" 
                          className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-bold"
                          value={formData.source}
                          onChange={e => setFormData({...formData, source: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Unit Sumber</Label>
                        <Input 
                          placeholder="Misal: Orang, Dus, Box" 
                          className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-medium"
                          value={formData.sourceUnit}
                          onChange={e => setFormData({...formData, sourceUnit: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Qty</Label>
                          <Input 
                            type="number" 
                            className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-black"
                            value={formData.qty}
                            onChange={e => setFormData({...formData, qty: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nominal Satuan</Label>
                          <Input 
                            type="number" 
                            placeholder="0"
                            className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-black text-emerald-600"
                            value={formData.unitPrice}
                            onChange={e => setFormData({...formData, unitPrice: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Total Jumlah Pemasukan</Label>
                        <div className="text-3xl font-black text-[#0b3d2e] mt-1">
                          Rp {parseFloat(formData.amount).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nama Barang / Jenis Pengeluaran</Label>
                        <Input 
                          required 
                          placeholder="Contoh: Pembelian Karpet, Bayar Listrik" 
                          className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-bold"
                          value={formData.itemName}
                          onChange={e => setFormData({...formData, itemName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Satuan Harga</Label>
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-black text-rose-600"
                          value={formData.unitPrice}
                          onChange={e => setFormData({...formData, unitPrice: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Qty</Label>
                          <Input 
                            type="number" 
                            className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-black"
                            value={formData.qty}
                            onChange={e => setFormData({...formData, qty: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Satuan</Label>
                          <Input 
                            placeholder="kg, pcs, set" 
                            className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-medium"
                            value={formData.unitType}
                            onChange={e => setFormData({...formData, unitType: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Kategori</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={val => setFormData({...formData, category: val})}
                        >
                          <SelectTrigger className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 font-bold">
                            <SelectValue placeholder="Pilih Kategori" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            <SelectItem value="Listrik & Air" className="rounded-xl font-bold py-3">Listrik & Air</SelectItem>
                            <SelectItem value="Kebersihan" className="rounded-xl font-bold py-3">Kebersihan</SelectItem>
                            <SelectItem value="Pemeliharaan" className="rounded-xl font-bold py-3">Pemeliharaan</SelectItem>
                            <SelectItem value="Kegiatan Dakwah" className="rounded-xl font-bold py-3">Kegiatan Dakwah</SelectItem>
                            <SelectItem value="Bantuan Sosial" className="rounded-xl font-bold py-3">Bantuan Sosial</SelectItem>
                            <SelectItem value="Operasional" className="rounded-xl font-bold py-3">Operasional</SelectItem>
                            <SelectItem value="Lainnya" className="rounded-xl font-bold py-3">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 bg-rose-50 p-6 rounded-[2rem] border border-rose-100 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-rose-700">Total Jumlah Pengeluaran</Label>
                        <div className="text-3xl font-black text-rose-900 mt-1">
                          Rp {parseFloat(formData.amount).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Keterangan / Catatan</Label>
                    <textarea 
                      placeholder="Tambahkan detail rincian transaksi di sini..." 
                      className="w-full min-h-[100px] p-6 rounded-[1.5rem] border-neutral-100 bg-neutral-50/50 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="flex-1 h-16 rounded-[1.5rem] font-bold bg-neutral-50 text-neutral-400 hover:text-neutral-900"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] h-16 rounded-[1.5rem] font-black bg-[#0b3d2e] hover:bg-[#062c21] shadow-2xl shadow-emerald-900/10 text-white uppercase tracking-widest"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : null}
                    {isSubmitting ? 'Memproses...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Transaksi')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
          <CardHeader className="p-8 sm:p-10 border-b border-neutral-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-[#0b3d2e]">Riwayat Transaksi</CardTitle>
                  <p className="text-xs text-neutral-400 font-medium">Monitoring pergerakan saldo masjid</p>
                </div>
              </div>
              <div className="relative w-full md:w-[400px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <Input 
                  placeholder="Cari sumber, keterangan, atau barang..." 
                  className="pl-14 h-14 rounded-2xl bg-neutral-50/50 border-transparent focus:bg-white focus:border-emerald-100 transition-all text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-32">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent shadow-xl"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-32">
                <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-neutral-200" />
                </div>
                <p className="text-lg font-bold text-neutral-300">Belum ada data transaksi</p>
                <p className="text-sm text-neutral-400">Silakan catat transaksi baru untuk melihat riwayat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/30">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Waktu & Tanggal</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Rincian Transaksi</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Kapasitas</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Nominal</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {filteredTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-neutral-50/50 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-neutral-600 line-height-none">
                                {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-tighter mt-1">
                                {new Date(tx.date).getFullYear()} • {new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0b3d2e] max-w-[250px] truncate">
                              {tx.itemName || tx.source || 'Lainnya'}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium mt-1 italic">
                              {tx.description || 'Tanpa catatan tambahan'}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <Badge variant="outline" className={cn(
                            "rounded-xl px-4 py-2 font-black text-[9px] uppercase tracking-widest border-none whitespace-nowrap shadow-sm",
                            tx.txType === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                             {tx.qty} {tx.unitType || tx.sourceUnit || 'Item'}
                          </Badge>
                        </td>
                        <td className="px-10 py-8">
                          <div className={cn("text-lg font-black tracking-tight", tx.txType === 'income' ? "text-emerald-600" : "text-rose-600")}>
                            {tx.txType === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-2xl h-12 w-12 text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                              onClick={() => handleEdit(tx)}
                            >
                              <Edit2 className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-2xl h-12 w-12 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                              onClick={() => handleDelete(tx.id)}
                            >
                              <Trash2 className="h-5 w-5" />
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
