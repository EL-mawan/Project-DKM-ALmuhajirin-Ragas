'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface StatusPopupProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'loading'
  title: string
  description?: string
  actionLabel?: string
}

export function StatusPopup({
  isOpen,
  onClose,
  type,
  title,
  description,
  actionLabel = 'Oke'
}: StatusPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] border-none p-0 overflow-hidden rounded-[2.5rem] bg-transparent shadow-none">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white p-8 text-center space-y-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            {/* Background decorative glow */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              type === 'success' ? "bg-emerald-500" : type === 'error' ? "bg-rose-500" : "bg-primary"
            )} />
            
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className={cn(
                  "h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg",
                  type === 'success' ? "bg-emerald-50 text-emerald-500" : 
                  type === 'error' ? "bg-rose-50 text-rose-500" : 
                  "bg-muted text-primary"
                )}
              >
                {type === 'success' && <CheckCircle2 className="h-10 w-10" />}
                {type === 'error' && <XCircle className="h-10 w-10" />}
                {type === 'loading' && <Loader2 className="h-10 w-10 animate-spin" />}
              </motion.div>
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black text-[#0b3d2e] tracking-tight">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed px-4">
                  {description}
                </DialogDescription>
              )}
            </div>

            <div className="pt-2">
              {type !== 'loading' ? (
                <Button 
                  onClick={onClose}
                  className={cn(
                    "w-full rounded-2xl py-6 font-bold text-white shadow-xl transition-all active:scale-95",
                    type === 'success' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : 
                    "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                  )}
                >
                  {actionLabel}
                </Button>
              ) : (
                <div className="h-12 w-full flex items-center justify-center text-muted-foreground font-medium animate-pulse text-sm">
                  Mohon tunggu sebentar...
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
