'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Calendar, 
  DollarSign, 
  Newspaper, 
  User,
  LayoutDashboard,
  Building,
  Users,
  FileText,
  MessageSquare,
  LogOut
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'User'

  // Only show on admin pages
  if (!pathname?.startsWith('/admin')) return null

  // Define nav items mapping based on user role
  const getNavItems = () => {
    const commonItems = {
      PANEL: { icon: LayoutDashboard, label: 'Panel', href: '/admin' },
      LOGOUT: { icon: LogOut, label: 'Keluar', href: '#logout', isLogout: true },
      AGENDA: { icon: Calendar, label: 'Agenda', href: '/admin/kegiatan' },
      BERITA: { icon: Newspaper, label: 'Berita', href: '/admin/berita' },
      STRUKTUR: { icon: Building, label: 'Struktur', href: '/admin/struktur' },
      JAMAAH: { icon: Users, label: 'Jamaah', href: '/admin/jamaah' },
      KEUANGAN: { icon: DollarSign, label: 'Keuangan', href: '/admin/keuangan' },
      LPJ: { icon: FileText, label: 'LPJ', href: '/admin/laporan' },
      KONTAK: { icon: MessageSquare, label: 'Pesan', href: '/admin/kontak' },
    }

    switch(userRole) {
      case 'Ketua DKM':
      case 'Tokoh Masyarakat':
        return [commonItems.PANEL, commonItems.STRUKTUR, commonItems.AGENDA, commonItems.BERITA, commonItems.LOGOUT]
      
      case 'Sekretaris DKM':
      case 'RISMA (Remaja Islam)':
        return [commonItems.PANEL, commonItems.JAMAAH, commonItems.AGENDA, commonItems.BERITA, commonItems.LOGOUT]
      
      case 'Bendahara DKM':
        return [commonItems.PANEL, commonItems.KEUANGAN, commonItems.LPJ, commonItems.KONTAK, commonItems.LOGOUT]
      
      case 'Master Admin':
        return [commonItems.PANEL, commonItems.JAMAAH, commonItems.KEUANGAN, commonItems.BERITA, commonItems.LOGOUT]

      default:
        return [commonItems.PANEL, commonItems.LOGOUT]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 sm:hidden pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0b3d2e]/95 backdrop-blur-2xl border border-white/10 h-20 rounded-[2.5rem] flex items-center justify-between px-4 w-full max-w-md shadow-2xl shadow-[#0b3d2e]/40 pointer-events-auto"
      >
        {navItems.map((item: any, i) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
          
          const NavContent = (
            <>
              <div className={cn(
                "h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 relative",
                isActive 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : item.isLogout ? "bg-rose-500/10 text-rose-400" : "text-emerald-100/40 hover:text-white"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active-pill"
                    className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className={cn(
                  "h-5 w-5 relative z-10 transition-transform duration-300", 
                  isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""
                )} />
                
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-widest mt-0.5 transition-colors duration-300",
                isActive ? "text-emerald-400" : item.isLogout ? "text-rose-400" : "text-emerald-100/20"
              )}>
                {item.label}
              </span>
            </>
          )

          if (item.isLogout) {
            return (
              <button 
                key={i} 
                onClick={() => confirm('Keluar dari sistem?') && signOut({ callbackUrl: '/login' })}
                className="flex flex-col items-center relative py-1 flex-1 h-full justify-center"
              >
                {NavContent}
              </button>
            )
          }

          return (
            <Link key={i} href={item.href} className="flex flex-col items-center relative py-1 flex-1">
              {NavContent}
            </Link>
          )
        })}
      </motion.nav>
    </div>
  )
}
