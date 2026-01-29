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
  className?: string
}

export function MobileAdminHeader({ title, subtitle, variant = 'dashboard', className }: MobileAdminHeaderProps) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'User'

  return (
    <div className={cn(
      "bg-white text-neutral-900 px-6 h-22 z-50 flex items-center justify-between shadow-sm border-b border-neutral-100 sm:hidden",
      className
    )}>
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center space-x-4"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-12 w-12 rounded-2xl bg-white p-1 flex items-center justify-center border border-neutral-100 shadow-sm"
        >
           <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
        </motion.div>
        <div>
          <h2 className="font-extrabold text-xl tracking-tighter text-neutral-900 leading-none">DKM Al-Muhajirin</h2>
          <p className="text-emerald-600 text-[8px] font-black uppercase tracking-widest mt-1.5 leading-none">
            Kp. Ragas Grenyang
          </p>
          <p className="text-neutral-400 text-[8px] font-bold mt-1 leading-none">
            {userRole} | {session?.user?.name || 'Administrator'}
          </p>
        </div>
      </motion.div>
      
      <div className="flex items-center space-x-2">
        <button className="h-10 w-10 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-500 border border-neutral-200 flex items-center justify-center relative transition-all shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </div>
  )
}
