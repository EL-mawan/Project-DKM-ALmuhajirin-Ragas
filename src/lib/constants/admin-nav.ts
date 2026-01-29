import { 
  BarChart3, 
  Users, 
  Building, 
  Heart, 
  Calendar, 
  DollarSign, 
  FileText, 
  Newspaper, 
  Image, 
  MessageSquare 
} from 'lucide-react'

export const ADMIN_MENU_ITEMS = [
  { icon: BarChart3, label: 'Ringkasan', href: '/admin', roles: ['any'], color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { icon: Users, label: 'Manajemen User', href: '/admin/users', roles: ['any'], color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
  { icon: Building, label: 'Struktur DKM', href: '/admin/struktur', roles: ['any'], color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { icon: Users, label: 'Data Jamaah', href: '/admin/jamaah', roles: ['any'], color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { icon: Heart, label: 'Kaum Dhuafa', href: '/admin/dhuafa', roles: ['any'], color: 'text-rose-500 bg-rose-50 border-rose-100' },
  { icon: Calendar, label: 'Agenda Kegiatan', href: '/admin/kegiatan', roles: ['any'], color: 'text-violet-500 bg-violet-50 border-violet-100' },
  { icon: DollarSign, label: 'Keuangan', href: '/admin/keuangan', roles: ['any'], color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
  { icon: FileText, label: 'Cetak LPJ', href: '/admin/laporan', roles: ['any'], color: 'text-slate-500 bg-slate-50 border-slate-100' },
  { icon: Newspaper, label: 'Berita & Artikel', href: '/admin/berita', roles: ['any'], color: 'text-orange-500 bg-orange-50 border-orange-100' },
  { icon: Image, label: 'Galeri Foto', href: '/admin/galeri', roles: ['any'], color: 'text-pink-500 bg-pink-50 border-pink-100' },
  { icon: MessageSquare, label: 'Kontak Pesan', href: '/admin/kontak', roles: ['any'], color: 'text-teal-500 bg-teal-50 border-teal-100' },
]
