'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building, Moon, Bell, Plus, ArrowUpRight, Search, Settings, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface MobileAdminHeaderProps {
  title?: string
  subtitle?: string
  variant?: 'dashboard' | 'simple'
}

export function MobileAdminHeader({ title, subtitle, variant = 'dashboard' }: MobileAdminHeaderProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'User'

  return (
    <div className="bg-[#062c21] text-white px-6 h-20 fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-2xl shadow-black/40 sm:hidden">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
           <div className="h-7 w-7 rounded-lg bg-white overflow-hidden flex items-center justify-center">
             <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
           </div>
        </div>
        <div>
          <p className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Al-Muhajirin</p>
          <p className="font-bold text-sm tracking-tight text-white line-clamp-1">
            {variant === 'dashboard' ? (session?.user?.name || 'Dashboard') : (title || 'Panel')}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-lg border border-white/10 flex items-center justify-center relative transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-rose-500 rounded-full ring-2 ring-[#062c21]" />
        </button>
      </div>
    </div>
  )
}
