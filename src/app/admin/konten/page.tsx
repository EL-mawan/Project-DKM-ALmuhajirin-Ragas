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
  Sparkles
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
      description: 'Bagian utama halaman depan'
    },
    { 
      key: 'stats', 
      label: 'Statistik', 
      icon: Users,
      fields: ['content'],
      description: 'Data statistik jamaah (JSON format)'
    },
    { 
      key: 'about', 
      label: 'Tentang / Visi Misi', 
      icon: BookOpen,
      fields: ['title', 'subtitle', 'description', 'content'],
      description: 'Informasi tentang DKM'
    },
    { 
      key: 'contact', 
      label: 'Kontak', 
      icon: Phone,
      fields: ['title', 'subtitle', 'description', 'content'],
      description: 'Informasi kontak dan alamat'
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
              <Sparkles className="h-8 w-8 text-primary" />
              Kelola Konten Homepage
            </h1>
            <p className="text-muted-foreground mt-2">
              Edit konten halaman depan website DKM Al-Muhajirin
            </p>
          </div>
          <Button 
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Website
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sectionConfig.map((config) => (
            <button
              key={config.key}
              onClick={() => setActiveSection(config.key)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                activeSection === config.key
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 bg-background'
              }`}
            >
              <config.icon className={`h-6 w-6 mb-3 ${
                activeSection === config.key ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <div className="font-bold text-foreground">{config.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {config.description}
              </div>
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="bg-background border border-border rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {currentConfig && <currentConfig.icon className="h-6 w-6 text-primary" />}
              <h2 className="text-2xl font-bold text-foreground">
                Edit {currentConfig?.label}
              </h2>
            </div>
            <Button 
              onClick={() => handleSave(activeSection)}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </div>

          <div className="space-y-6">
            {/* Title Field */}
            {currentConfig?.fields.includes('title') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Judul Utama
                </label>
                <input
                  type="text"
                  value={currentSection.title || ''}
                  onChange={(e) => updateSectionField(activeSection, 'title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan judul utama..."
                />
              </div>
            )}

            {/* Subtitle Field */}
            {currentConfig?.fields.includes('subtitle') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sub Judul
                </label>
                <input
                  type="text"
                  value={currentSection.subtitle || ''}
                  onChange={(e) => updateSectionField(activeSection, 'subtitle', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Masukkan sub judul..."
                />
              </div>
            )}

            {/* Description Field */}
            {currentConfig?.fields.includes('description') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Deskripsi
                </label>
                <textarea
                  value={currentSection.description || ''}
                  onChange={(e) => updateSectionField(activeSection, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Masukkan deskripsi..."
                />
              </div>
            )}

            {/* Content Field (for JSON or long text) */}
            {currentConfig?.fields.includes('content') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Konten {activeSection === 'stats' && '(Format JSON)'}
                </label>
                <textarea
                  value={currentSection.content || ''}
                  onChange={(e) => updateSectionField(activeSection, 'content', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                  placeholder={activeSection === 'stats' 
                    ? '{"jamaahKK": 150, "jamaahRemaja": 80, "kaumDhuafa": 25}'
                    : 'Masukkan konten tambahan...'
                  }
                />
              </div>
            )}

            {/* Image Upload */}
            {currentConfig?.fields.includes('imageUrl') && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Gambar
                </label>
                
                {currentSection.imageUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border mb-4">
                    <img 
                      src={currentSection.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <input
                    type="text"
                    value={currentSection.imageUrl || ''}
                    onChange={(e) => updateSectionField(activeSection, 'imageUrl', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="URL gambar atau upload file..."
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
                    <Button type="button" variant="outline" className="gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-muted/30 border border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Preview
          </h3>
          <div className="bg-background rounded-2xl p-8 border border-border">
            {activeSection === 'hero' && (
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {currentSection.subtitle || 'DKM Al-Muhajirin'}
                </Badge>
                <h1 className="text-4xl font-bold text-foreground">
                  {currentSection.title || 'Judul Hero Section'}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {currentSection.description || 'Deskripsi hero section...'}
                </p>
                {currentSection.imageUrl && (
                  <img 
                    src={currentSection.imageUrl} 
                    alt="Hero" 
                    className="w-full max-w-md rounded-2xl shadow-lg"
                  />
                )}
              </div>
            )}

            {activeSection === 'about' && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentSection.title || 'Judul About Section'}
                </h2>
                <p className="text-xl text-primary font-semibold">
                  {currentSection.subtitle || 'Sub judul...'}
                </p>
                <p className="text-muted-foreground">
                  {currentSection.description || 'Deskripsi...'}
                </p>
                {currentSection.content && (
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <p className="text-sm">{currentSection.content}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentSection.title || 'Hubungi Kami'}
                </h2>
                <p className="text-muted-foreground">
                  {currentSection.description || 'Informasi kontak...'}
                </p>
                {currentSection.content && (
                  <div className="space-y-2 text-sm">
                    <pre className="bg-muted/50 p-4 rounded-xl overflow-auto">
                      {currentSection.content}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'stats' && currentSection.content && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  try {
                    const stats = JSON.parse(currentSection.content)
                    return Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 p-6 rounded-xl text-center">
                        <div className="text-3xl font-bold text-primary">{String(value)}</div>
                        <div className="text-sm text-muted-foreground mt-2">{key}</div>
                      </div>
                    ))
                  } catch {
                    return <p className="text-destructive">Format JSON tidak valid</p>
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
