'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
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
  MessageSquare,
  Bell
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
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats')
      const data = await res.json()
      if (res.ok) setNotificationCount(data.unreadNotifications || 0)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchNotificationCount()
    // Poll every 1 minute
    const interval = setInterval(fetchNotificationCount, 60000)
    return () => clearInterval(interval)
  }, [])

  // Header visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = scrollRef.current?.scrollTop || 0
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past header
        setIsVisible(false)
      } else {
        // Scrolling up or at top
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])
  
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
      <div className="h-screen bg-neutral-50 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0b3d2e] border-r border-[#1a4d3d] lg:translate-x-0 lg:static hidden md:flex flex-col text-white shadow-2xl">
          <div className="flex flex-col h-full">
            <div className="p-8 flex items-center justify-between border-b border-[#1a4d3d]">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-white p-1 overflow-hidden flex items-center justify-center border border-white/10">
                  <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white">DKM Al-Muhajirin</h2>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Kp. Ragas Grenyang</p>
                  <p className="text-[9px] font-bold text-emerald-100/40 mt-1.5 leading-none">
                    {userRole} | {session?.user?.name || 'Administrator'}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center p-3 rounded-xl text-sm font-semibold group ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500' 
                          : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-400' : ''}`} />
                      {item.label}
                    </Link>
                  </div>
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

        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Header Container (Fixed) */}
          <div className={`fixed top-0 right-0 z-40 h-22 left-0 md:left-72 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            {/* Mobile Header */}
            <MobileAdminHeader 
              title={title} 
              subtitle={subtitle} 
              variant={pathname === '/admin' ? 'dashboard' : 'simple'} 
              className="w-full h-full"
              notificationCount={notificationCount}
            />

            {/* Desktop header */}
            <header className="h-22 border-b border-neutral-200 bg-white/70 backdrop-blur-xl hidden sm:flex items-center justify-between px-8 w-full">
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
                
                <Link href="/admin/kontak">
                  <Button variant="outline" size="icon" className="rounded-xl border-neutral-200 relative">
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-white">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Button variant="outline" size="icon" className="rounded-xl border-neutral-200">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </header>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto pt-22"
          >
            <div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
