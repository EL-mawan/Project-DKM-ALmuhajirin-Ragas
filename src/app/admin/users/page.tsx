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
  User,
  Mail,
  Shield,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function UsersAdmin() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    phone: '',
    address: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles')
      ])
      const [usersData, rolesData] = await Promise.all([
        usersRes.json(),
        rolesRes.json()
      ])
      setUsers(usersData || [])
      setRoles(rolesData || [])
    } catch (error) {
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
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingUser ? 'User diperbarui' : 'User ditambahkan')
        setIsModalOpen(false)
        setEditingUser(null)
        setFormData({ name: '', email: '', password: '', roleId: '', phone: '', address: '' })
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan user')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus user ini?')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('User dihapus')
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menghapus user')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleToggleStatus = async (user: any) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      })
      if (res.ok) {
        toast.success(`User ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
        fetchData()
      }
    } catch (error) {
      toast.error('Gagal mengubah status')
    }
  }

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Manajemen User" subtitle="Kelola pengguna sistem dan hak akses (RBAC).">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b3d2e] hidden sm:block">Daftar Pengguna</h2>
            <p className="text-muted-foreground text-sm hidden sm:block">Kelola wewenang akses masing-masing pengurus.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setEditingUser(null)
              setFormData({ name: '', email: '', password: '', roleId: '', phone: '', address: '' })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg w-full sm:w-auto py-6 sm:py-2">
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0b3d2e]">
                  {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input 
                      required 
                      className="rounded-xl"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      required 
                      type="email"
                      className="rounded-xl"
                      value={formData.email}
                      disabled={!!editingUser}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        required 
                        type="password"
                        className="rounded-xl"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Role / Jabatan</Label>
                    <Select 
                      value={formData.roleId} 
                      onValueChange={val => setFormData({...formData, roleId: val})}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {roles.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-2xl py-6 font-bold mt-4"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isSubmitting ? 'Memproses...' : (editingUser ? 'Simpan Perubahan' : 'Buat Akun')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden shadow-gray-200/50">
          <CardHeader className="bg-white border-b p-8 sm:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <CardTitle className="text-xl font-bold text-[#0b3d2e]">Database User</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari user..." 
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      <th className="px-8 py-5">Nama & Email</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-bold text-[#0b3d2e]">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" /> {user.email}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role.name}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <button onClick={() => handleToggleStatus(user)}>
                            <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`} variant="outline">
                              {user.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 hover:bg-primary/5 hover:text-primary"
                              onClick={() => {
                                setEditingUser(user)
                                setFormData({
                                  name: user.name,
                                  email: user.email,
                                  roleId: user.roleId,
                                  password: '',
                                  phone: user.phone || '',
                                  address: user.address || ''
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
                              onClick={() => handleDelete(user.id)}
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
