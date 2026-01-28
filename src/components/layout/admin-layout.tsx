'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building, 
  LogOut, 
  UserCheck, 
  Settings,
  BarChart3,
  Users,
  Heart,
  Calendar,
  DollarSign,
  FileText,
  Newspaper,
  Image,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Layout } from './index'
import { MobileAdminHeader } from '@/components/admin/mobile-header'

import { ADMIN_MENU_ITEMS } from '@/lib/constants/admin-nav'

import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Protect all admin routes
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Prevent accidental tab close/reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Browsers often ignore the custom message, 
      // but this triggers the system confirmation dialog.
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b3d2e]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-emerald-100/60 animate-pulse uppercase tracking-widest">Sistem Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userRole = session.user.role

  const filteredMenuItems = ADMIN_MENU_ITEMS.filter(item => 
    item.roles.includes('any') || item.roles.includes(userRole)
  )

  const handleSignOut = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem Admin?')) {
      signOut({ callbackUrl: '/login' })
    }
  }

  return (
    <Layout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-neutral-50 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0b3d2e] border-r border-[#1a4d3d] transition-transform duration-300 lg:translate-x-0 lg:static hidden md:flex flex-col text-white shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 flex items-center justify-between border-b border-[#1a4d3d]">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-white p-1 overflow-hidden flex items-center justify-center border border-white/10">
                  <img src="/logo.jpg" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">Admin DKM</h2>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Al-Muhajirin</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center p-3 rounded-xl text-sm font-semibold transition-all group ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500' 
                        : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-110'}`} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="p-6 border-t border-[#1a4d3d] bg-black/10 mt-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                  {session.user.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-white">{session.user.name || 'Admin'}</p>
                  <p className="text-[10px] text-emerald-400/70 uppercase font-black tracking-wider truncate">{userRole}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-none group transition-all h-12 font-bold" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2 group-hover:-translate-x-1" />
                Keluar
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Body */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <MobileAdminHeader 
            title={title} 
            subtitle={subtitle} 
            variant={pathname === '/admin' ? 'dashboard' : 'simple'} 
          />
          {/* Spacer for fixed header on mobile */}
          <div className="h-20 sm:hidden" />

          {/* Desktop header */}
          <header className="h-20 border-b border-neutral-200 bg-white/70 backdrop-blur-xl sticky top-0 z-30 px-8 hidden sm:flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-none">{title}</h1>
                <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                <UserCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-tighter">{userRole} AUTHENTICATED</span>
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-neutral-200">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pt-[var(--header-height,0px)] sm:pt-0">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  )
}
