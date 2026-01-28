'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  DollarSign,
  UserCheck,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  Heart,
  Image,
  MessageSquare,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Moon,
  Plus,
  Wallet,
  User
} from 'lucide-react'
import { Layout } from '@/components/layout'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ADMIN_MENU_ITEMS } from '@/lib/constants/admin-nav'
import { cn, formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Menyiapkan Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userRole = session.user.role

  const filteredMenuItems = ADMIN_MENU_ITEMS.filter(item => 
    item.roles.includes('any') || item.roles.includes(userRole)
  )

  // Role-specific stats and welcome text
  const getDashboardConfig = () => {
    switch(userRole) {
      case 'Master Admin':
        return {
          title: 'Sistem Kendali Utama',
          welcome: 'Kelola seluruh aspek sistem DKM Al-Muhajirin.',
          stats: [
            { label: 'Total User', value: '12', icon: Users, color: 'text-blue-500' },
            { label: 'Audit Log', value: '128', icon: FileText, color: 'text-gray-500' },
            { label: 'Uptime Sistem', value: '99.9%', icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Database Size', value: '2.4MB', icon: Building, color: 'text-amber-500' }
          ]
        }
      case 'Bendahara DKM':
        return {
          title: 'Manajemen Perbendaharaan',
          welcome: 'Pantau arus kas dan transparansi dana umat.',
          stats: [
            { label: 'Pemasukan/Bln', value: formatCurrency(45200000), icon: ArrowUpRight, color: 'text-emerald-500' },
            { label: 'Pengeluaran/Bln', value: formatCurrency(32800000), icon: ArrowDownRight, color: 'text-rose-500' },
            { label: 'Saldo Aktif', value: formatCurrency(142500000), icon: DollarSign, color: 'text-primary' },
            { label: 'Laporan Pending', value: '2', icon: AlertCircle, color: 'text-amber-500' }
          ]
        }
      case 'Ketua DKM':
        return {
          title: 'Dashboard Kebijakan',
          welcome: 'Tinjau dan setujui program kerja serta laporan.',
          stats: [
            { label: 'Persetujuan Baru', value: '5', icon: AlertCircle, color: 'text-amber-500' },
            { label: 'Kegiatan Aktif', value: '8', icon: Calendar, color: 'text-blue-500' },
            { label: 'Total Jamaah', value: '250+', icon: Users, color: 'text-primary' },
            { label: 'Pesan Masuk', value: '14', icon: MessageSquare, color: 'text-indigo-500' }
          ]
        }
      default:
        return {
          title: 'Panel Kendali Konten',
          welcome: 'Selamat datang kembali di sistem kolaborasi DKM.',
          stats: [
            { label: 'Data Jamaah', value: '250', icon: Users, color: 'text-blue-500' },
            { label: 'Agenda Masjid', value: '12', icon: Calendar, color: 'text-emerald-500' },
            { label: 'Galeri Baru', value: '45', icon: Image, color: 'text-purple-500' },
            { label: 'Pesan', value: '3', icon: MessageSquare, color: 'text-indigo-500' }
          ]
        }
    }
  }

  const { title, welcome, stats: roleStats } = getDashboardConfig()

  return (
    <AdminLayout title={title} subtitle={welcome}>
      <div className="p-6 sm:p-8 space-y-8">
        {/* Mobile-only Stats Card (Scrollable) */}
        <div className="sm:hidden -mt-2 mb-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b3d2e] rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-primary/5 rounded-full blur-[50px]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 leading-none">Status Kependudukan</p>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1">Status Kendali Utama</h2>
                  <div className="flex items-center text-emerald-400 text-[10px] font-black bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 w-fit">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +12.5%
                  </div>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest">
                  Data
                </div>
              </div>
              
              {/* Minimalist Sparkline Effect */}
              <div className="flex items-end space-x-2 h-10 px-1 mt-8">
                {[30, 60, 40, 85, 55, 75, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                    className="flex-1 bg-linear-to-t from-emerald-500/40 to-emerald-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile-only Tiny Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:hidden">
          {roleStats.slice(0, 2).map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-4xl border border-neutral-100 shadow-sm">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-neutral-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Desktop Stats Grid */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-neutral-50 border border-neutral-100 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
              <p className="text-3xl font-black text-neutral-900 mt-1 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 sm:pb-0">
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Access for Mobile */}
            <div className="sm:hidden bg-white rounded-[3rem] p-6 shadow-2xl shadow-black/5 border border-neutral-100">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-extrabold text-[#0b3d2e] text-[10px] uppercase tracking-[0.2em] opacity-60">Pintasan Admin</h3>
                <div className="h-1 w-10 bg-neutral-100 rounded-full" />
              </div>
              <div className="grid grid-cols-4 gap-y-8 gap-x-3">
                {filteredMenuItems.map((item, i) => (
                  <Link key={i} href={item.href} className="flex flex-col items-center space-y-2 group">
                    <div className="relative">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95 shadow-sm border",
                        (item as any).color || "bg-neutral-50 border-neutral-100/50 text-[#0b3d2e]/40"
                      )}>
                        <item.icon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-6" />
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#0b3d2e]/60 uppercase tracking-tighter text-center leading-tight max-w-[60px] line-clamp-2 transition-colors group-hover:text-primary">
                      {item.label.replace('Manajemen ', '').replace('Data ', '').replace('Artikel', '').replace('Kegiatan', '')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-[#0b3d2e]">Aktivitas Terupdate</h3>
                <Button variant="link" className="text-primary font-bold">Lensa Audit</Button>
              </div>
              <div className="bg-white rounded-[2.5rem] sm:rounded-4xl border border-neutral-100 overflow-hidden shadow-sm">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-5 flex items-center justify-between border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0b3d2e]">Pembaruan Inventaris Masjid</p>
                        <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Audit Log #{1420 + i}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <Badge variant="outline" className="rounded-full border-neutral-200 text-neutral-500">2 jam lalu</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Card (Desktop Only) */}
          <div className="hidden lg:block space-y-6">
            <h3 className="text-lg font-bold text-[#0b3d2e]">Shortcut Kendali</h3>
            <div className="bg-linear-to-br from-[#0b3d2e] to-[#0b3d2e]/90 rounded-4xl p-8 text-white shadow-xl shadow-[#0b3d2e]/20 space-y-6">
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                Butuh bantuan pengelolaan? Akses modul utama dengan cepat melalui tombol dibawah ini sesuai kewenangan Anda.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="bg-white/10 border-white/20 text-white rounded-2xl h-24 flex-col hover:bg-white hover:text-primary transition-all">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Acara</span>
                </Button>
                <Button variant="secondary" className="bg-white/10 border-white/20 text-white rounded-2xl h-24 flex-col hover:bg-white hover:text-primary transition-all">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Jamaah</span>
                </Button>
                <Button variant="secondary" className="bg-white/10 border-white/20 text-white rounded-2xl h-24 flex-col hover:bg-white hover:text-primary transition-all">
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Kas</span>
                </Button>
                <Button variant="secondary" className="bg-white/10 border-white/20 text-white rounded-2xl h-24 flex-col hover:bg-white hover:text-primary transition-all">
                  <Newspaper className="h-6 w-6 mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Berita</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}