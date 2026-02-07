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
      label: 'Hero / Beranda', 
      icon: Home,
      fields: ['title', 'subtitle', 'description', 'imageUrl'],
      description: 'Banner Utama'
    },
    { 
      key: 'about', 
      label: 'Profil / Visi Misi', 
      icon: BookOpen,
      fields: ['title', 'subtitle', 'description'],
      description: 'Tentang DKM'
    },
    { 
      key: 'transparency', 
      label: 'Transparansi', 
      icon: TrendingUp,
      fields: ['title', 'subtitle', 'description'],
      description: 'Teks Keuangan'
    },
    { 
      key: 'contact', 
      label: 'Kontak', 
      icon: Phone,
      fields: ['title', 'subtitle', 'description', 'content'],
      description: 'Hubungi Kami'
    },
    { 
      key: 'stats', 
      label: 'Statistik', 
      icon: Users,
      fields: ['title', 'content'],
      description: 'Data Statistik'
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary shadow-sm" />
              Kelola Konten Homepage
            </h1>
            <p className="text-muted-foreground mt-2">
              Sesuaikan informasi, teks, dan gambar di halaman depan website DKM Al-Muhajirin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 uppercase tracking-wider text-[10px] font-bold">
              CMS Panel
            </Badge>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sectionConfig.map((config) => (
            <button
              key={config.key}
              onClick={() => setActiveSection(config.key)}
              className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                activeSection === config.key
                  ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5'
                  : 'border-border hover:border-primary/30 bg-background'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                activeSection === config.key ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                <config.icon className="h-6 w-6" />
              </div>
              <div className="font-bold text-foreground line-clamp-1">{config.label}</div>
              <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                {config.description}
              </div>
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {currentConfig && <currentConfig.icon className="h-5 w-5" />}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Edit {currentConfig?.label}
              </h2>
            </div>
            <Button 
              onClick={() => handleSave(activeSection)}
              disabled={saving}
              className="gap-2 px-6 rounded-xl shadow-lg shadow-primary/20"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Form Fields */}
            <div className="space-y-6">
              {/* Title Field */}
              {currentConfig?.fields.includes('title') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Judul Utama
                  </label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={(e) => updateSectionField(activeSection, 'title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Masukkan judul utama..."
                  />
                </div>
              )}

              {/* Subtitle Field */}
              {currentConfig?.fields.includes('subtitle') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Sub Judul / Label
                  </label>
                  <input
                    type="text"
                    value={currentSection.subtitle || ''}
                    onChange={(e) => updateSectionField(activeSection, 'subtitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Masukkan sub judul..."
                  />
                </div>
              )}

              {/* Description Field */}
              {currentConfig?.fields.includes('description') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Deskripsi / Paragraf
                  </label>
                  <textarea
                    value={currentSection.description || ''}
                    onChange={(e) => updateSectionField(activeSection, 'description', e.target.value)}
                    rows={currentConfig.key === 'hero' ? 3 : 5}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                    placeholder="Masukkan deskripsi..."
                  />
                </div>
              )}

              {/* Content Field (for JSON or long text) */}
              {currentConfig?.fields.includes('content') && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Konten Tambahan {activeSection === 'stats' && '(Format JSON)'}
                  </label>
                  <textarea
                    value={currentSection.content || ''}
                    onChange={(e) => updateSectionField(activeSection, 'content', e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-xs leading-relaxed"
                    placeholder={activeSection === 'stats' 
                      ? '{\n  "jamaahKK": 150,\n  "jamaahRemaja": 80,\n  "kaumDhuafa": 25\n}'
                      : 'Masukkan konten tambahan...'
                    }
                  />
                  {activeSection === 'stats' && (
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                      * Gunakan format JSON yang valid untuk data statistik
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Visual Preview & Image Upload */}
            <div className="space-y-8">
              {/* Image Section */}
              {currentConfig?.fields.includes('imageUrl') && (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Latar Belakang / Gambar
                  </label>
                  
                  <div className="relative group overflow-hidden rounded-2xl border aspect-video bg-muted/30">
                    {currentSection.imageUrl ? (
                      <img 
                        src={currentSection.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                        <span className="text-xs uppercase tracking-widest font-bold">No Image Selected</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={currentSection.imageUrl || ''}
                      onChange={(e) => updateSectionField(activeSection, 'imageUrl', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="URL gambar..."
                    />
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
                      <Button type="button" variant="outline" className="gap-2 h-[46px] rounded-xl px-4 border-dashed border-2 hover:border-primary/50" asChild>
                        <span>
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">Upload</span>
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}

              {/* Simplified Preview Card */}
              <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-border">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Live Preview</span>
                </div>
                
                <div className="bg-background rounded-xl p-6 border shadow-sm">
                  {activeSection === 'hero' && (
                    <div className="space-y-3">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold">
                        {currentSection.subtitle || 'Subtitle'}
                      </Badge>
                      <h3 className="text-xl font-bold line-clamp-2 leading-tight">
                        {currentSection.title || 'Main Title'}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {currentSection.description || 'Section description goes here...'}
                      </p>
                    </div>
                  )}

                  {(activeSection === 'about' || activeSection === 'transparency' || activeSection === 'contact') && (
                    <div className="space-y-3 text-center">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20">
                        {currentSection.subtitle || 'Label'}
                      </Badge>
                      <h3 className="text-lg font-bold">
                        {currentSection.title || 'Section Title'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {currentSection.description || 'Description text...'}
                      </p>
                    </div>
                  )}

                  {activeSection === 'stats' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-primary">150+</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Jamaah</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <div className="text-lg font-bold text-primary">25th</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Tahun</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
