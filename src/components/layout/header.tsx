'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { 
  Menu, 
  Home, 
  Users, 
  Building, 
  Heart, 
  Calendar, 
  FileText, 
  Newspaper, 
  Image, 
  Phone,
  LogIn,
  User,
  ChevronDown
} from 'lucide-react'

const navigation = [
  { name: 'Beranda', href: '#beranda', icon: Home },
  { 
    name: 'Profil', 
    icon: Building,
    submenu: [
      { name: 'Tentang Kami', href: '#profil', description: 'Sejarah dan visi misi masjid' },
      { name: 'Struktur Organisasi', href: '#profil', description: 'Pengurus Masjid Al-Muhajirin' },
    ]
  },
  { 
    name: 'Jamaah', 
    icon: Heart, 
    submenu: [
      { name: 'Kepala Keluarga', href: '#informasi', description: 'Data jamaah KK' },
      { name: 'Remaja Masjid', href: '#informasi', description: 'Kegiatan pemuda' },
      { name: 'Kaum Dhuafa', href: '#layanan', description: 'Pemberdayaan sosial' }
    ]
  },
  { 
    name: 'Informasi', 
    icon: Newspaper, 
    submenu: [
      { name: 'Kegiatan', href: '#informasi', description: 'Agenda dan jadwal masjid' },
      { name: 'Berita & Artikel', href: '#informasi', description: 'Info terbaru seputar umat' },
      { name: 'Galeri Foto', href: '#galeri', description: 'Dokumentasi kegiatan' }
    ]
  },
  { 
    name: 'Layanan', 
    icon: FileText, 
    submenu: [
      { name: 'Laporan Keuangan', href: '#layanan', description: 'Transparansi dana umat' },
      { name: 'Hubungi Kami', href: '#kontak', description: 'Layanan aspirasi jamaah' }
    ]
  },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group outline-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Logo Al-Muhajirin" className="h-full w-full object-contain" />
            </div>
            <div className="hidden lg:block leading-tight">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Al-Muhajirin
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                Masjid Jami' Ragas Grenyang
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative group p-1">
                {item.submenu ? (
                  <div className="cursor-default flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3 opacity-50 group-hover:rotate-180 transition-transform" />
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )}
                
                {/* Mega Dropdown */}
                {item.submenu && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 p-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 bg-background border border-border/50 rounded-2xl shadow-2xl shadow-primary/5">
                    <div className="grid gap-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="group/item flex flex-col p-3 rounded-xl hover:bg-primary/3 transition-colors"
                        >
                          <span className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">{subitem.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{subitem.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" className="hidden sm:flex rounded-full text-muted-foreground hover:text-foreground" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
              </Link>
            </Button>
            
            <Button className="hidden md:flex rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" asChild>
              <Link href="#kontak">
                <Heart className="mr-2 h-4 w-4 animate-pulse" />
                Infaq & Sedekah
              </Link>
            </Button>
            
            {/* Mobile Menu Toggle */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="xl:hidden">
                <Button variant="outline" size="icon" className="rounded-full border-border/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l border-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu Navigasi Mobile</SheetTitle>
                  <SheetDescription>
                    Akses cepat ke seluruh layanan dan informasi Masjid Jami' Al-Muhajirin Ragas Grenyang.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border/50">
                    <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 overflow-hidden shadow-md">
                        <img src="/logo.png" alt="Logo Al-Muhajirin" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground">Al-Muhajirin</h2>
                        <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                          Masjid Jami' Ragas Grenyang
                        </p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 py-8">
                    <nav className="space-y-6">
                      {navigation.map((item) => (
                        <div key={item.name} className="space-y-4">
                          <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                            {item.name}
                          </h3>
                          <div className="grid gap-1">
                            {item.submenu ? (
                              item.submenu.map((subitem) => (
                                <Link
                                  key={subitem.name}
                                  href={subitem.href}
                                  className="flex items-center px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 rounded-xl transition-colors"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subitem.name}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href={item.href}
                                className="flex items-center px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 rounded-xl transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="p-6 border-t border-border/50 space-y-3">
                    <Button variant="outline" className="w-full rounded-xl py-6" asChild>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Masuk Ke Admin
                      </Link>
                    </Button>
                    <Button className="w-full rounded-xl py-6" asChild>
                      <Link href="#kontak" onClick={() => setIsMenuOpen(false)}>
                        <Heart className="mr-2 h-4 w-4" />
                        Infaq & Sedekah
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}