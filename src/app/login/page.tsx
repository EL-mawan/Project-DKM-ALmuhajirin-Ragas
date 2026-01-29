'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building, Eye, EyeOff, Loader2, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatusPopup } from '@/components/ui/status-popup'
import { useStatusPopup } from '@/lib/hooks/use-status-popup'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { statusProps, showSuccess, showError } = useStatusPopup()

  // Silent redirect if already logged in (no alert)
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Explicit validation
    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Email atau password salah. Silakan coba lagi.')
      } else {
        // Refresh session
        await getSession()
        
        // Show success popup
        showSuccess(
          'Login Berhasil',
          'Selamat datang kembali di Panel Administrasi Al-Muhajirin.'
        )

        // Small delay then redirect
        setTimeout(() => {
          router.replace('/admin')
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3d2e] relative overflow-hidden p-4">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 islamic-pattern opacity-[0.03]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-xl shadow-emerald-500/20 overflow-hidden">
                  <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-white mb-2">Assalamualaikum</CardTitle>
            <CardDescription className="text-emerald-100/60 font-medium">
              Panel Administrasi Al-Muhajirin
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-200 rounded-2xl">
                    <AlertDescription className="font-medium text-center">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest ml-1">Email System</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-100/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="katuran.com"
                    className="h-14 pl-11 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-emerald-100/20 focus:bg-white/10 focus:border-emerald-500/50 transition-all text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-emerald-100/70 text-xs font-bold uppercase tracking-widest ml-1">Key Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-100/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-14 pl-11 pr-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-emerald-100/20 focus:bg-white/10 focus:border-emerald-500/50 transition-all text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/40 hover:text-emerald-100 transition-colors p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Otentikasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Masuk Ke Dashboard</span>
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-10 flex flex-col items-center space-y-6">
              <p className="text-emerald-100/40 text-sm font-medium">
                Problem login? Hubungi{' '}
                <Link href="/kontak" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Administrator
                </Link>
              </p>
              
              <Link 
                href="/" 
                className="inline-flex items-center text-sm font-bold text-emerald-100/60 hover:text-white group transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-emerald-100/20 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; 2026 Al-Muhajirin Ragas Grenyang
        </p>
      </motion.div>
      <StatusPopup {...statusProps} />
    </div>
  )
}