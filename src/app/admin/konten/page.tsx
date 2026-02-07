'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Upload, 
  Eye, 
  RefreshCw,
  Home,
  Users,
  BookOpen,
  Phone,
  Image as ImageIcon,
  FileText,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ContentSection {
  id: string
  section: string
  title?: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  isActive: boolean
  order: number
}

export default function KelolaKontenPage() {
  const [sections, setSections] = useState<ContentSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const { toast } = useToast()

  const sectionConfig = [
    { 
      key: 'hero', 
      label: 'Beranda', 
      icon: Home,
      fields: ['title', 'subtitle', 'description', 'imageUrl'],
      description: 'Banner Utama'
    },
    { 
      key: 'about', 
      label: 'Profil', 
      icon: BookOpen,
      fields: ['title', 'subtitle', 'description'],
      description: 'Tentang DKM'
    },
    { 
      key: 'stats', 
      label: 'Statistik', 
      icon: Users,
      fields: ['title', 'content'],
      description: 'Data Statistik'
    },
    { 
      key: 'contact', 
      label: 'Kontak', 
      icon: Phone,
      fields: ['title', 'subtitle', 'description', 'content'],
      description: 'Hubungi Kami'
    }
  ]

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        setSections(data)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat konten',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      const sectionData = sections.find(s => s.section === section)
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      if (res.ok) {
        toast({
          title: 'Berhasil',
          description: 'Konten berhasil disimpan'
        })
        fetchContent()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan konten',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (section: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('section', section)

    try {
      const res = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const { url } = await res.json()
        updateSectionField(section, 'imageUrl', url)
        toast({
          title: 'Berhasil',
          description: 'Gambar berhasil diupload'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengupload gambar',
        variant: 'destructive'
      })
    }
  }

  const updateSectionField = (section: string, field: string, value: string) => {
    setSections(prev => prev.map(s => 
      s.section === section ? { ...s, [field]: value } : s
    ))
  }

  const getCurrentSection = () => {
    return sections.find(s => s.section === activeSection) || {
      id: '',
      section: activeSection,
      title: '',
      subtitle: '',
      description: '',
      content: '',
      imageUrl: '',
      isActive: true,
      order: 0
    }
  }

  const currentConfig = sectionConfig.find(s => s.key === activeSection)
  const currentSection = getCurrentSection()

  if (loading) {
    return (
      <AdminLayout title="Kelola Konten" subtitle="Edit konten halaman depan website">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kelola Konten" subtitle="Edit konten halaman depan website">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-border/40">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0b3d2e] tracking-tight">
                CMS Panel <span className="text-primary/40 font-light">|</span> Homepage
              </h1>
              <p className="text-muted-foreground mt-1 font-medium">
                Pusat kendali visual dan informasi beranda Masjid Al-Muhajirin.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl border border-border/50">
            <Badge variant="outline" className="px-4 py-2 border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl uppercase tracking-[0.15em] text-[10px] font-black">
              LIVE SYSTEM
            </Badge>
            <div className="h-6 w-px bg-border/60" />
            <Button 
              onClick={() => handleSave(activeSection)}
              disabled={saving}
              className="gap-2 px-8 py-6 rounded-xl shadow-xl shadow-primary/20 bg-[#0b3d2e] hover:bg-[#062c21] transition-all active:scale-95"
            >
              {saving ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span className="font-bold">Simpan Perubahan</span>
            </Button>
          </div>
        </div>

        {/* Section Tabs - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
          {sectionConfig.map((config) => (
            <button
              key={config.key}
              onClick={() => setActiveSection(config.key)}
              className={`shrink-0 lg:shrink w-64 lg:w-auto p-6 rounded-4xl border-2 transition-all text-left relative overflow-hidden group ${
                activeSection === config.key
                  ? 'border-primary bg-white shadow-2xl shadow-primary/10 -translate-y-1'
                  : 'border-transparent bg-white/60 hover:bg-white hover:border-primary/20 shadow-sm'
              }`}
            >
              {activeSection === config.key && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 shadow-lg ${
                activeSection === config.key 
                  ? 'bg-[#0b3d2e] text-white rotate-6 scale-110 shadow-emerald-900/20' 
                  : 'bg-white text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
              }`}>
                <config.icon className="h-7 w-7" />
              </div>
              <div className="relative">
                <div className={`font-black text-lg ${activeSection === config.key ? 'text-[#0b3d2e]' : 'text-foreground/70'}`}>
                  {config.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">
                  {config.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Left Column: Form Fields (xl:col-span-7) */}
          <div className="xl:col-span-7 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-border/40 shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-border/40">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0b3d2e] shadow-inner">
                  {currentConfig && <currentConfig.icon className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#0b3d2e] tracking-tight">
                    Konfigurasi Konten
                  </h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {currentConfig?.label}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Title & Subtitle Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {currentConfig?.fields.includes('title') && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-[#0b3d2e] uppercase tracking-[0.2em] ml-1">
                        Judul Utama
                      </label>
                      <input
                        type="text"
                        value={currentSection.title || ''}
                        onChange={(e) => updateSectionField(activeSection, 'title', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-emerald-50 bg-neutral-50 focus:bg-white focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-medium"
                        placeholder="Misal: Membangun Peradaban..."
                      />
                    </div>
                  )}

                  {currentConfig?.fields.includes('subtitle') && (
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-[#0b3d2e] uppercase tracking-[0.2em] ml-1">
                        Sub-title / Label
                      </label>
                      <input
                        type="text"
                        value={currentSection.subtitle || ''}
                        onChange={(e) => updateSectionField(activeSection, 'subtitle', e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-emerald-50 bg-neutral-50 focus:bg-white focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground font-medium"
                        placeholder="Misal: Visi & Misi"
                      />
                    </div>
                  )}
                </div>

                {/* Description Area */}
                {currentConfig?.fields.includes('description') && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#0b3d2e] uppercase tracking-[0.2em] ml-1">
                      Deskripsi Narasi
                    </label>
                    <textarea
                      value={currentSection.description || ''}
                      onChange={(e) => updateSectionField(activeSection, 'description', e.target.value)}
                      rows={6}
                      className="w-full px-6 py-5 rounded-4xl border-2 border-emerald-50 bg-neutral-50 focus:bg-white focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 resize-none transition-all text-foreground font-medium leading-relaxed"
                      placeholder="Tuliskan deskripsi lengkap di sini..."
                    />
                  </div>
                )}

                {/* Content Area (JSON) */}
                {currentConfig?.fields.includes('content') && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-black text-[#0b3d2e] uppercase tracking-[0.2em]">
                        Data {activeSection === 'stats' ? 'Statistik' : 'Lanjutan'}
                      </label>
                      <Badge variant="outline" className="text-[9px] font-bold text-amber-600 bg-amber-50 border-none">
                        FORMAT {activeSection === 'stats' ? 'JSON' : 'PLAINTEXT'}
                      </Badge>
                    </div>
                    <textarea
                      value={currentSection.content || ''}
                      onChange={(e) => updateSectionField(activeSection, 'content', e.target.value)}
                      rows={8}
                      className="w-full px-6 py-5 rounded-4xl border-2 border-emerald-50 bg-[#0b3d2e]/5 focus:bg-white focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 resize-none transition-all font-mono text-xs leading-loose text-emerald-900 shadow-inner"
                      placeholder={activeSection === 'stats' 
                        ? '{\n  "jamaahKK": 150,\n  "jamaahRemaja": 80,\n  "kaumDhuafa": 25\n}'
                        : 'Masukkan konten tambahan...'
                      }
                    />
                    {activeSection === 'stats' && (
                      <p className="text-[10px] text-muted-foreground ml-4 italic font-medium">
                        * Ubah angka di atas untuk memperbarui data statistik di beranda.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Preview & Media (xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-8 xl:sticky xl:top-8">
            {/* Image Upload Section */}
            {currentConfig?.fields.includes('imageUrl') && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-border/40 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <h3 className="text-sm font-black text-[#0b3d2e] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Media Visual
                </h3>
                
                <div className="relative aspect-video rounded-3xl border-4 border-neutral-50 overflow-hidden shadow-2xl bg-[#0b3d2e]/5 group/img">
                  {currentSection.imageUrl ? (
                    <img 
                      src={currentSection.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-900/40">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-10 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-black">No Media Asset</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={currentSection.imageUrl || ''}
                        onChange={(e) => updateSectionField(activeSection, 'imageUrl', e.target.value)}
                        className="w-full pl-5 pr-12 py-3.5 rounded-2xl border-2 border-emerald-50 bg-neutral-50 focus:bg-white text-xs font-medium focus:outline-none"
                        placeholder="Media URL..."
                      />
                      <FileText className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200" />
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(activeSection, file)
                        }}
                      />
                      <Button type="button" variant="outline" className="h-[52px] rounded-2xl px-6 border-2 border-emerald-100 bg-white hover:bg-emerald-50 text-emerald-900 font-bold gap-2 shadow-sm" asChild>
                        <span>
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">Upload</span>
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="bg-[#0b3d2e] rounded-[2.5rem] p-8 lg:p-10 shadow-2xl shadow-emerald-900/30 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-1000" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Preview System</span>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              
              <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-4xl p-8 border border-white/20 shadow-inner min-h-[250px] flex flex-col justify-center">
                {activeSection === 'hero' && (
                  <div className="space-y-6 text-center lg:text-left">
                    <Badge className="bg-emerald-400/20 text-emerald-300 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {currentSection.subtitle || 'Subtitle Display'}
                    </Badge>
                    <h3 className="text-3xl lg:text-4xl font-black leading-tight drop-shadow-lg">
                      {currentSection.title || 'Main Headline'}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-3 leading-relaxed font-medium italic">
                      {currentSection.description || 'Section description preview text will appear here as you type...'}
                    </p>
                  </div>
                )}

                {(activeSection === 'about' || activeSection === 'contact') && (
                  <div className="space-y-6 text-center">
                    <Badge variant="outline" className="text-[10px] uppercase font-black tracking-[0.2em] border-emerald-400/30 text-emerald-400 px-5 py-2 rounded-full bg-emerald-400/5">
                      {currentSection.subtitle || 'Section Label'}
                    </Badge>
                    <h3 className="text-2xl lg:text-3xl font-black tracking-tight">
                      {currentSection.title || 'Title Preview'}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto font-medium">
                      {currentSection.description || 'Description text preview...'}
                    </p>
                  </div>
                )}

                {activeSection === 'stats' && (
                  <div className="space-y-8">
                    <h4 className="text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Dashboard Statistik</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center transition-transform hover:scale-105">
                        <div className="text-3xl font-black text-white px-2">150+</div>
                        <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mt-2">Jamaah</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center transition-transform hover:scale-105">
                        <div className="text-3xl font-black text-white px-2">24/7</div>
                        <div className="text-[9px] text-white/50 uppercase font-black tracking-widest mt-2">Layanan</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center relative z-10">
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">
                  Layout Preview Dioptimalkan untuk Perangkat Desktop
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
