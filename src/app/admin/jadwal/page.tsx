'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Download,
  Mail,
  User as UserIcon
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import jsPDF from 'jspdf'
import { StatusPopup } from '@/components/ui/status-popup'

export default function JadwalTugasPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('JUMAT')
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'KHOTIB',
    category: activeTab,
    name: '',
    description: ''
  })

  // State khusus untuk bulk input Tarawih
  const [tarawihData, setTarawihData] = useState({
    imam: '',
    bilal1: '',
    bilal2: '',
    kamilin: '',
    witir: '',
    malamKe: [] as string[],
    bulan: 'Ramadhan 1447 H'
  })

  // State khusus untuk Idul Fitri / Idul Adha
  const [eidData, setEidData] = useState({
    tanggal: '',
    bulan: '',
    tahun: '',
    imam: '',
    khotib: '',
    bilal: '',
    iqomah: ''
  })

  // State untuk melacak item grup yang sedang diedit (agar bisa dihapus sebelum simpan baru)
  const [editingGroupItems, setEditingGroupItems] = useState<any[] | null>(null)

  // Status Popup State
  const [popup, setPopup] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'loading'
    title: string
    description?: string
  }>({
    isOpen: false,
    type: 'success',
    title: ''
  })

  useEffect(() => {
    setFormData(prev => ({ ...prev, category: activeTab }))
  }, [activeTab])

  const canCreate = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Sekretaris DKM', 'RISMA (Remaja Islam)'].includes(session.user.role)
  const canUpdate = canCreate
  const canDelete = session?.user?.role && ['Master Admin', 'Ketua DKM', 'Sekretaris DKM'].includes(session.user.role)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/jadwal?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) setData(json)
    } catch (error) {
      toast.error('Gagal memuat data jadwal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Jika sedang edit grup, hapus item lama terlebih dahulu
      if (editingGroupItems) {
        for (const it of editingGroupItems) {
          await fetch(`/api/admin/jadwal/${it.id}`, { method: 'DELETE' })
        }
      }

      if (formData.category === 'TARAWIH' && !editingItem) {
        // Bulk save for Tarawih
        const roles = [
          { type: 'IMAM_TARAWIH', name: tarawihData.imam },
          { type: 'BILAL_1', name: tarawihData.bilal1 },
          { type: 'BILAL_2', name: tarawihData.bilal2 },
          { type: 'KAMILIN', name: tarawihData.kamilin },
          { type: 'DOA_WITIR', name: tarawihData.witir }
        ]

        for (const malam of tarawihData.malamKe) {
          for (const role of roles) {
            if (!role.name) continue
            await fetch('/api/admin/jadwal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...formData,
                type: role.type,
                name: role.name,
                description: `Malam Ke-${malam}`
              })
            })
          }
        }
        setPopup({
          isOpen: true,
          type: 'success',
          title: 'Berhasil!',
          description: `Jadwal Tarawih (${tarawihData.malamKe.length} malam) telah berhasil disimpan ke sistem.`
        })
      } else if ((formData.category === 'IDUL_FITRI' || formData.category === 'IDUL_ADHA') && !editingItem) {
        // Bulk save for Eid
        const roles = [
          { type: 'IMAM_SHOLAT', name: eidData.imam },
          { type: 'KHOTIB', name: eidData.khotib },
          { type: 'BILAL', name: eidData.bilal },
          { type: 'IQOMAH', name: eidData.iqomah }
        ];

        for (const role of roles) {
          if (!role.name) continue;
          await fetch('/api/admin/jadwal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              type: role.type,
              name: role.name,
              description: `Tanggal: ${eidData.tanggal}, Bulan: ${eidData.bulan}, Tahun: ${eidData.tahun}`
            })
          });
        }
        setPopup({
          isOpen: true,
          type: 'success',
          title: 'Berhasil!',
          description: `Jadwal ${categories.find(c => c.value === formData.category)?.label} telah berhasil diterbitkan.`
        })
      } else {
        const url = editingItem ? `/api/admin/jadwal/${editingItem.id}` : '/api/admin/jadwal'
        const method = editingItem ? 'PATCH' : 'POST'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (res.ok) {
          setPopup({
            isOpen: true,
            type: 'success',
            title: editingItem ? 'Update Berhasil!' : 'Jadwal Terbit!',
            description: editingItem ? 'Perubahan pada jadwal tugas telah disimpan.' : 'Penugasan baru telah berhasil ditambahkan.'
          })
        } else {
          throw new Error('Gagal simpan')
        }
      }

      setIsModalOpen(false)
      setEditingItem(null)
      resetForm()
      await fetchData()
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, silent: boolean = false) => {
    if (!silent && !confirm('Hapus jadwal ini?')) return
    try {
      const res = await fetch(`/api/admin/jadwal/${id}`, { method: 'DELETE' })
      if (res.ok && !silent) {
        setPopup({
          isOpen: true,
          type: 'success',
          title: 'Terhapus!',
          description: 'Data penugasan jadwal telah dihapus dari sistem.'
        })
        fetchData()
      }
      return res.ok
    } catch (error) {
      if (!silent) toast.error('Gagal menghapus')
      return false
    }
  }

  const handleDeleteGroup = async (group: { nights: any[], items: any[] }) => {
    const nightLabel = group.nights.length > 0 ? (typeof group.nights[0] === 'number' ? `Malam Ke ${group.nights.join(', ')}` : group.nights[0]) : 'Grup ini';
    if (!confirm(`Hapus seluruh data penugasan untuk ${nightLabel}? (${group.items.length} entri)`)) return
    
    setLoading(true)
    try {
      let successCount = 0;
      for (const item of group.items) {
        const ok = await handleDelete(item.id, true)
        if (ok) successCount++
      }
      setPopup({
        isOpen: true,
        type: 'success',
        title: 'Grup Dihapus!',
        description: `${successCount} penugasan dalam grup ini telah berhasil dihapus.`
      })
      fetchData()
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus grup')
    } finally {
      setLoading(false)
    }
  }

  const openEditGroup = (group: { nights: any[], items: any[] }) => {
    // Populate form with existing data from the group
    if (group.items[0].category === 'TARAWIH') {
      const imam = group.items.find(it => it.type === 'IMAM_TARAWIH')?.name || ''
      const b1 = group.items.find(it => it.type === 'BILAL_1')?.name || ''
      const b2 = group.items.find(it => it.type === 'BILAL_2')?.name || ''
      const km = group.items.find(it => it.type === 'KAMILIN')?.name || ''
      const wt = group.items.find(it => it.type === 'DOA_WITIR')?.name || ''
      
      setTarawihData({
        imam,
        bilal1: b1,
        bilal2: b2,
        kamilin: km,
        witir: wt,
        malamKe: group.nights.map(n => n.toString()),
        bulan: tarawihData.bulan // keep current bulan
      })
    } else if (group.items[0].category === 'IDUL_FITRI' || group.items[0].category === 'IDUL_ADHA') {
      const imam = group.items.find(it => it.type === 'IMAM_SHOLAT')?.name || ''
      const khotib = group.items.find(it => it.type === 'KHOTIB')?.name || ''
      const bilal = group.items.find(it => it.type === 'BILAL')?.name || ''
      const iqomah = group.items.find(it => it.type === 'IQOMAH')?.name || ''
      
      const desc = group.items[0].description || ''
      const mt = desc.match(/Tanggal: (.*?), Bulan: (.*?), Tahun: (.*)/)

      setEidData({
        tanggal: mt ? mt[1] : '',
        bulan: mt ? mt[2] : '',
        tahun: mt ? mt[3] : '',
        imam,
        khotib,
        bilal,
        iqomah
      })
    }
    
    setEditingGroupItems(group.items)
    setIsModalOpen(true)
    toast.info('Form telah diisi dengan data grup. Simpan untuk memperbarui.')
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'KHOTIB',
      category: activeTab,
      name: '',
      description: ''
    })
    setTarawihData(prev => ({
      ...prev,
      imam: '',
      bilal1: '',
      bilal2: '',
      kamilin: '',
      witir: '',
      malamKe: []
    }))
    setEidData({
      tanggal: '',
      bulan: '',
      tahun: '',
      imam: '',
      khotib: '',
      bilal: '',
      iqomah: ''
    })
    setEditingGroupItems(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.closest('form')
      if (form) {
        const index = Array.from(form.elements).indexOf(e.currentTarget as any)
        if (index > -1 && index < form.elements.length - 1) {
          e.preventDefault()
          const next = form.elements[index + 1] as HTMLElement
          if (next && next.focus) next.focus()
        }
      }
    }
  }

  const openEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: item.type,
      category: item.category,
      name: item.name,
      description: item.description || ''
    })
    setIsModalOpen(true)
  }

  // PDF Jumat
  const generateFridayPDF = (targetDate: string) => {
    const doc = new jsPDF()
    const items = data.filter(d => new Date(d.date).toISOString().split('T')[0] === targetDate && d.category === 'JUMAT')
    const formattedDate = new Date(targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const centerX = doc.internal.pageSize.getWidth() / 2

    try { doc.addImage('/logo.png', 'PNG', 20, 10, 20, 20) } catch (e) { doc.circle(30, 20, 10, 'S') }

    doc.setFontSize(14).setFont('times', 'bold').text('Dewan Kemakmuran Masjid (DKM) Al-Muhajirin', centerX + 10, 18, { align: 'center' })
    doc.setFontSize(12).text('Kp. Ragas Grenyang Desa Argawana Kecamatan Puloampel', centerX + 10, 25, { align: 'center' })
    doc.setFontSize(11).setFont('times', 'italic').text('Jadwal Tugas Sholat Jum\'at', centerX, 35, { align: 'center' })
    doc.setLineWidth(0.8).line(15, 38, 195, 38)
    doc.setFont('times', 'normal').setFontSize(11).text(`Tanggal :        ${formattedDate}`, 30, 48)

    const startY = 55
    const rowHeight = 10
    const labelWidth = 50
    const tasks = [
      { label: 'Imam Sholat', type: 'IMAM_JUMAT' },
      { label: 'Khotib', type: 'KHOTIB' },
      { label: 'Bilal / Muadzin 1', type: 'BILAL' },
      { label: 'Bilal / Muadzin 2', type: 'ADZAN' },
      { label: 'Iqomah', type: 'IQOMAH' }
    ]

    tasks.forEach((task, i) => {
      const curY = startY + (i * rowHeight)
      doc.setFillColor(64, 86, 50).rect(15, curY, labelWidth, rowHeight, 'F')
      doc.setTextColor(255).setFontSize(10).text(task.label, 17, curY + 6.5)
      doc.setTextColor(0).setFontSize(11).text(':', 15 + labelWidth + 2, curY + 6.5)
      let name = items.find(it => it.type === task.type)?.name || '..................................................................'
      if (!name.includes('.')) { name = name.toUpperCase(); doc.setFontSize(14).setFont('times', 'bold') } else doc.setFontSize(11)
      doc.text(name, 15 + labelWidth + 5, curY + 6.5).setFont('times', 'normal').setDrawColor(200).setLineWidth(0.1).line(15 + labelWidth + 4, curY + 8, 195, curY + 8, 'S')
    })
    
    doc.save(`Jadwal_Jumat_${targetDate}.pdf`)
  }

  // PDF Tarawih
  const generateTarawihPDF = () => {
    const doc = new jsPDF()
    const centerX = doc.internal.pageSize.getWidth() / 2
    const tarawihRecords = data.filter(d => d.category === 'TARAWIH')
    
    try { doc.addImage('/logo.png', 'PNG', 30, 10, 18, 18) } catch (e) {}

    doc.setFontSize(14).setFont('times', 'bold').text('DKM Al-Muhajirin Kp. Ragas Grenyang', centerX + 10, 17, { align: 'center' })
    doc.setFontSize(12).setFont('times', 'italic').text('Jadwal Tugas Sholat Tarawih', centerX + 10, 23, { align: 'center' })
    doc.setLineWidth(0.5).line(15, 28, 195, 28)
    
    doc.setFontSize(10).setFont('times', 'normal').text(`Bulan        : ${tarawihData.bulan}`, 15, 35)

    // Table Header
    const startY = 42
    const colWidths = [15, 35, 35, 35, 30, 30] // Malam, Imam, Bilal1, Bilal2, Kamilin, Witir
    const headers = ['Malam', 'Imam', 'Bilal 1', 'Bilal 2', "Do'a Kamilin", "Do'a Witir"]
    const rowHeight = 7

    doc.setFillColor(64, 86, 50).rect(15, startY, 180, rowHeight, 'F')
    doc.setTextColor(255).setFontSize(9).setFont('times', 'bold')
    
    let curX = 15
    headers.forEach((h, i) => {
      doc.text(h, curX + colWidths[i]/2, startY + 5, { align: 'center' })
      curX += colWidths[i]
    })

    // Rows (30 Malam)
    doc.setTextColor(0).setFont('times', 'normal')
    for (let i = 1; i <= 30; i++) {
        const rowY = startY + (i * rowHeight)
        const nightData = tarawihRecords.filter(d => {
            if (!d.description) return false;
            const m = d.description.match(/(\d+)/);
            return m && parseInt(m[0], 10) === i;
        })
        
        let rowX = 15
        // Box for row
        doc.setDrawColor(0).setLineWidth(0.1)
        
        // Column 1: Malam
        doc.rect(rowX, rowY, colWidths[0], rowHeight)
        doc.text(i.toString(), rowX + colWidths[0]/2, rowY + 5, { align: 'center' })
        rowX += colWidths[0]

        // Other Columns
        const roles = ['IMAM_TARAWIH', 'BILAL_1', 'BILAL_2', 'KAMILIN', 'DOA_WITIR']
        roles.forEach((role, idx) => {
            doc.rect(rowX, rowY, colWidths[idx+1], rowHeight)
            const val = nightData.find(d => d.type === role)?.name || ''
            doc.setFontSize(8).text(val, rowX + 2, rowY + 5)
            rowX += colWidths[idx+1]
        })
    }

    const footerY = 265
    doc.setFontSize(9).text('Mengetahui,', 165, footerY, { align: 'center' })
    doc.text('Ketua DKM Al-Muhajirin', 165, footerY + 4, { align: 'center' })
    doc.setFont('times', 'bold').text('H. Agung Gunawan', 165, footerY + 20, { align: 'center' })
    doc.line(145, footerY + 21, 185, footerY + 21)

    doc.save('Jadwal_Tarawih.pdf')
  }

  // PDF Idul Fitri / Idul Adha
  const generateEidPDF = (category: string) => {
    const doc = new jsPDF()
    const centerX = doc.internal.pageSize.getWidth() / 2
    const label = categories.find(c => c.value === category)?.label || 'Sholat Hari Raya'
    const records = data.filter(d => d.category === category)
    
    // Attempt to extract date info from first record's description if any
    let tgl = eidData.tanggal || '....', bln = eidData.bulan || '....', thn = eidData.tahun || '....'
    if (records.length > 0 && records[0].description) {
        const d = records[0].description;
        const mt = d.match(/Tanggal: (.*?), Bulan: (.*?), Tahun: (.*)/);
        if (mt) { tgl = mt[1]; bln = mt[2]; thn = mt[3]; }
    }

    try { doc.addImage('/logo.png', 'PNG', 30, 10, 18, 18) } catch (e) { doc.circle(39, 19, 9, 'S') }

    doc.setFontSize(14).setFont('times', 'bold').text('Dewan Kemakmuran Masjid (DKM) Al-Muhajirin', centerX + 10, 17, { align: 'center' })
    doc.setFontSize(12).text('Kp. Ragas Grenyang Desa Argawana Kecamatan Puloampel', centerX + 10, 23, { align: 'center' })
    doc.setFontSize(11).setFont('times', 'italic').text(`Jadwal Tugas ${label}`, centerX, 32, { align: 'center' })
    doc.setLineWidth(0.5).line(15, 35, 195, 35)
    
    doc.setFontSize(11).setFont('times', 'normal')
    doc.text(`Tanggal     : ${tgl}`, 15, 45)
    doc.text(`Bulan        : ${bln}`, 15, 52)
    doc.text(`Tahun        : ${thn}`, 15, 59)

    const startY = 68
    const rowHeight = 12
    const labelWidth = 60

    const tasks = [
        { label: 'Imam Sholat', type: 'IMAM_SHOLAT' },
        { label: 'Khotib', type: 'KHOTIB' },
        { label: 'Bilal', type: 'BILAL' },
        { label: 'Iqomah', type: 'IQOMAH' }
    ]

    tasks.forEach((task, i) => {
        const curY = startY + (i * rowHeight)
        doc.setFillColor(64, 86, 50).rect(15, curY, labelWidth, rowHeight, 'F')
        doc.setTextColor(255).setFontSize(10).text(task.label, 17, curY + 7.5)
        doc.setTextColor(0).setFontSize(11).text(':', 15 + labelWidth + 2, curY + 7.5)
        
        const name = records.find(it => it.type === task.type)?.name || '..................................................................'
        doc.text(name, 15 + labelWidth + 5, curY + 7.5)
        doc.setDrawColor(200).setLineWidth(0.1).line(15 + labelWidth + 4, curY + 9, 195, curY + 9, 'S')
    })

    const footerY = startY + (tasks.length * rowHeight) + 20
    doc.text('Mengetahui,', 160, footerY, { align: 'center' })
    doc.text('Ketua DKM Al-Muhajirin', 160, footerY + 5, { align: 'center' })
    doc.setFont('times', 'bold').text('H. Agung Gunawan', 160, footerY + 25, { align: 'center' })
    doc.setLineWidth(0.2).line(140, footerY + 26, 180, footerY + 26)

    doc.save(`Jadwal_${label.replace(/ /g, '_')}.pdf`)
  }

  const filteredData = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                      item.type.toLowerCase().includes(search.toLowerCase())
    const matchTab = item.category === activeTab
    return matchSearch && matchTab
  })

  const categories = [
    { value: 'JUMAT', label: "Sholat Jum'at" },
    { value: 'TARAWIH', label: 'Sholat Tarawih' },
    { value: 'IDUL_FITRI', label: 'Sholat Idul Fitri' },
    { value: 'IDUL_ADHA', label: 'Sholat Idul Adha' }
  ]

  const getTaskTypesByCategory = (cat: string) => {
    switch(cat) {
      case 'JUMAT':
        return [
          { value: 'IMAM_JUMAT', label: 'Imam Sholat Jum\'at' },
          { value: 'KHOTIB', label: 'Khotib' },
          { value: 'BILAL', label: 'Bilal' },
          { value: 'ADZAN', label: 'Adzan' },
          { value: 'IQOMAH', label: 'Iqomah' }
        ]
      case 'TARAWIH':
        return [
          { value: 'IMAM_TARAWIH', label: 'Imam Tarawih' },
          { value: 'BILAL_1', label: 'Bilal 1' },
          { value: 'BILAL_2', label: 'Bilal 2' },
          { value: 'KAMILIN', label: 'Do\'a Kamilin' },
          { value: 'DOA_WITIR', label: 'Do\'a Witir' }
        ]
      default:
        return [
          { value: 'IMAM_SHOLAT', label: 'Imam' },
          { value: 'KHOTIB', label: 'Khotib' },
          { value: 'BILAL', label: 'Bilal' },
          { value: 'IQOMAH', label: 'Iqomah' }
        ]
    }
  }

  const allTaskTypes = [
    ...getTaskTypesByCategory('JUMAT'),
    ...getTaskTypesByCategory('TARAWIH'),
    ...getTaskTypesByCategory('IDUL_FITRI'),
    ...getTaskTypesByCategory('IDUL_ADHA')
  ].reduce((acc: any[], current) => {
    if (!acc.find(item => item.value === current.value)) return acc.concat([current]);
    return acc;
  }, []);

  const filledNights = new Set(
    data
      .filter(item => item.category === 'TARAWIH')
      .map(item => {
        if (!item.description) return null;
        // Robust regex to extract the first number from description (assuming it's the night number)
        const match = item.description.match(/(\d+)/);
        return match ? parseInt(match[0], 10).toString() : null;
      })
      .filter(Boolean) as string[]
  );

  return (
    <AdminLayout title="Jadwal Tugas" subtitle="Kelola penugasan imam, khotib, dan petugas operasional masjid.">
      <div className="p-6 md:p-10 space-y-8">
        {/* Actions & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex bg-white p-1.5 rounded-3xl border border-neutral-100 shadow-sm overflow-x-auto w-full lg:w-auto">
             {categories.map(cat => (
               <button 
                 key={cat.value}
                 onClick={() => setActiveTab(cat.value)}
                 className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === cat.value ? 'bg-[#0b3d2e] text-white' : 'text-neutral-400 hover:text-[#0b3d2e]'}`}
               >
                 {cat.label}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <Input placeholder="Cari nama petugas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 rounded-2xl border-neutral-100 bg-white" />
            </div>
            {canCreate && (
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) { setEditingItem(null); setEditingGroupItems(null); resetForm(); } }}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl bg-[#0b3d2e] hover:bg-[#062c21] font-black uppercase tracking-widest text-xs">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#0b3d2e] p-8 text-white">
                  <DialogTitle className="text-2xl font-black">
                    {editingGroupItems ? `Update Jadwal ${categories.find(c => c.value === activeTab)?.label}` : (activeTab === 'TARAWIH' ? 'Setor Jadwal Tarawih' : (editingItem ? 'Edit Jadwal' : 'Tambah Jadwal'))}
                  </DialogTitle>
                  <p className="text-emerald-100/60 text-xs mt-1 italic">
                    {activeTab === 'TARAWIH' ? 'Isi seluruh petugas untuk satu malam sekaligus.' : 'Input penugasan rutin DKM.'}
                  </p>
                </div>
                <form id="jadwal-form" onSubmit={handleSubmit} className="p-8 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date / Month Selection based on Tab */}
                    {activeTab === 'TARAWIH' ? (
                        <div className="space-y-4 col-span-1 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase text-[#0b3d2e] bg-emerald-50 px-3 py-1 rounded-full text-center block">Pilih Malam Ke (Bisa lebih dari satu)</Label>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 bg-neutral-50 rounded-4xl border border-neutral-100 italic">
                                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
                                    const isFilled = filledNights.has(num.toString());
                                    return (
                                        <label key={num} className={`flex flex-col items-center gap-1 relative ${isFilled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer group'}`}>
                                            <input 
                                                type="checkbox" 
                                                className={`w-5 h-5 rounded-lg border-neutral-300 text-[#0b3d2e] focus:ring-emerald-500 transition-all ${isFilled ? 'cursor-not-allowed bg-neutral-200' : 'cursor-pointer'}`}
                                                checked={isFilled ? true : tarawihData.malamKe.includes(num.toString())}
                                                disabled={isFilled}
                                                onChange={(e) => {
                                                    const val = num.toString()
                                                    if (e.target.checked) {
                                                        setTarawihData(prev => ({ ...prev, malamKe: [...prev.malamKe, val] }))
                                                    } else {
                                                        setTarawihData(prev => ({ ...prev, malamKe: prev.malamKe.filter(n => n !== val) }))
                                                    }
                                                }}
                                            />
                                            <span className={`text-[9px] font-black ${isFilled ? 'text-[#0b3d2e]/50' : 'text-neutral-400 group-hover:text-emerald-700'}`}>{num}</span>
                                            {isFilled && <div className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full border border-white shadow-sm"></div>}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (activeTab === 'IDUL_FITRI' || activeTab === 'IDUL_ADHA') ? (
                        <div className="space-y-4 col-span-1 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase text-[#0b3d2e] bg-emerald-50 px-3 py-1 rounded-full text-center block">Detail Hari Raya</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-neutral-400">Tanggal</Label>
                                    <Input placeholder="Contoh: 1" value={eidData.tanggal} onChange={e => setEidData({...eidData, tanggal: e.target.value})} className="h-11 rounded-xl" onKeyDown={handleKeyDown} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-neutral-400">Bulan</Label>
                                    <Input placeholder="Contoh: Syawal" value={eidData.bulan} onChange={e => setEidData({...eidData, bulan: e.target.value})} className="h-11 rounded-xl" onKeyDown={handleKeyDown} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-neutral-400">Tahun</Label>
                                    <Input placeholder="Contoh: 1447 H" value={eidData.tahun} onChange={e => setEidData({...eidData, tahun: e.target.value})} className="h-11 rounded-xl" onKeyDown={handleKeyDown} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black uppercase text-neutral-400">Tanggal</Label>
                             <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-11 rounded-xl" required />
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[10px] font-black uppercase text-neutral-400">Kategori</Label>
                             <Select value={formData.category} disabled onValueChange={v => setFormData({...formData, category: v})}>
                                <SelectTrigger className="h-11 rounded-xl bg-neutral-50/50 border-neutral-100"><SelectValue /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                             </Select>
                          </div>
                        </>
                    )}
                 </div>

                  {activeTab === 'TARAWIH' && !editingItem ? (
                      <div className="grid grid-cols-1 gap-3 border-t pt-4 mt-4">
                          <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-neutral-400">Periode / Bulan (Untuk PDF)</Label>
                              <Input 
                                placeholder="Contoh: Ramadhan 1447 H" 
                                value={tarawihData.bulan} 
                                onChange={e => setTarawihData({...tarawihData, bulan: e.target.value})} 
                                className="h-11 rounded-xl bg-neutral-50"
                                onKeyDown={handleKeyDown}
                              />
                          </div>
                          <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase text-emerald-600">Nama Imam</Label>
                              <Input 
                                placeholder="Imam Tarawih..." 
                                value={tarawihData.imam} 
                                onChange={e => setTarawihData({...tarawihData, imam: e.target.value})} 
                                className="h-11 rounded-xl font-bold" 
                                required 
                                onKeyDown={handleKeyDown}
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-neutral-400">Bilal 1</Label>
                                <Input 
                                    placeholder="Nama..." 
                                    value={tarawihData.bilal1} 
                                    onChange={e => setTarawihData({...tarawihData, bilal1: e.target.value})} 
                                    className="h-11 rounded-xl" 
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-neutral-400">Bilal 2</Label>
                                <Input 
                                    placeholder="Nama..." 
                                    value={tarawihData.bilal2} 
                                    onChange={e => setTarawihData({...tarawihData, bilal2: e.target.value})} 
                                    className="h-11 rounded-xl" 
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-neutral-400">Do'a Kamilin</Label>
                                <Input 
                                    placeholder="Nama..." 
                                    value={tarawihData.kamilin} 
                                    onChange={e => setTarawihData({...tarawihData, kamilin: e.target.value})} 
                                    className="h-11 rounded-xl" 
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-neutral-400">Do'a Witir</Label>
                                <Input 
                                    placeholder="Nama..." 
                                    value={tarawihData.witir} 
                                    onChange={e => setTarawihData({...tarawihData, witir: e.target.value})} 
                                    className="h-11 rounded-xl" 
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                          </div>
                      </div>
                  ) : (
                      <>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-neutral-400">Jenis Tugas</Label>
                            <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>{getTaskTypesByCategory(formData.category).map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-neutral-400">Nama Petugas</Label>
                            <Input placeholder="Masukkan nama..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-11 rounded-xl font-bold text-emerald-700" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-neutral-400">Keterangan / Malam Ke (Opsional)</Label>
                            <Input placeholder="Contoh: Malam Ke-1..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                      </>
                  )}

                  <DialogFooter className="pt-4">
                    <Button form="jadwal-form" type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#0b3d2e] hover:bg-[#062c21] font-black uppercase tracking-widest text-sm shadow-xl">
                      {loading ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Terbitkan Jadwal')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        {/* Schedule List */}
        <Card className="rounded-[3rem] border-none shadow-2xl shadow-neutral-200/50 overflow-hidden bg-white">
          <CardHeader className="p-6 md:p-10 border-b border-neutral-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-black text-slate-900">Daftar Penugasan</CardTitle>
              <p className="text-[10px] md:text-xs text-neutral-400 mt-1 italic font-medium">Monitoring tugas aktif masjid.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {activeTab === 'JUMAT' && filteredData.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => generateFridayPDF(new Date(filteredData[0].date).toISOString().split('T')[0])} className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-8 md:h-9 px-3 md:px-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest flex-1 sm:flex-none">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> PDF Jumat
                </Button>
              )}
              {activeTab === 'TARAWIH' && filteredData.length > 0 && (
                <Button variant="outline" size="sm" onClick={generateTarawihPDF} className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-8 md:h-9 px-3 md:px-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest flex-1 sm:flex-none">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Cetak Tarawih
                </Button>
              )}
              {(activeTab === 'IDUL_FITRI' || activeTab === 'IDUL_ADHA') && filteredData.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => generateEidPDF(activeTab)} className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-8 md:h-9 px-3 md:px-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest flex-1 sm:flex-none">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Cetak PDF
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="rounded-xl border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 h-8 md:h-9 px-3 md:px-4 font-black uppercase text-[9px] md:text-[10px] tracking-widest flex-1 sm:flex-none">
                  Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0b3d2e] border-t-transparent shadow-sm"></div>
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Menyelaraskan Data...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="p-20 text-center">
                 <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar className="h-10 w-10 text-neutral-200" /></div>
                 <p className="text-lg font-bold text-neutral-300 italic">{search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada jadwal di kategori ini'}</p>
              </div>
            ) : (
              <>
                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-neutral-50/50">
                        {activeTab === 'TARAWIH' ? (
                          <>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                Malam
                            </th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Daftar Petugas</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Aksi</th>
                          </>
                        ) : (
                          <>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Petugas</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Jenis Tugas</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Waktu / Tanggal</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-neutral-400">Aksi</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50/50">
                      {activeTab === 'TARAWIH' ? (
                        (() => {
                          const tarawihOrder: { [key: string]: number } = {
                            'IMAM_TARAWIH': 1, 'BILAL_1': 2, 'BILAL_2': 3, 'KAMILIN': 4, 'DOA_WITIR': 5
                          };

                          const nightGroups: { [key: string]: any[] } = {};
                          filteredData.forEach(item => {
                            const m = item.description?.match(/(\d+)/);
                            const key = m ? m[0] : 'Lainnya';
                            if (!nightGroups[key]) nightGroups[key] = [];
                            nightGroups[key].push(item);
                          });

                          const lineupGroups: { nights: (number|string)[], items: any[] }[] = [];
                          Object.entries(nightGroups).forEach(([key, items]) => {
                            const sortedItems = items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99));
                            const lineupKey = sortedItems.map(it => `${it.type}:${it.name}`).join('|');
                            const existing = lineupGroups.find(g => 
                              g.items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99))
                                     .map(it => `${it.type}:${it.name}`).join('|') === lineupKey
                            );
                            
                            if (existing && activeTab === 'TARAWIH' && key !== 'Lainnya') {
                              existing.nights.push(parseInt(key));
                            } else {
                              lineupGroups.push({ 
                                nights: [activeTab === 'TARAWIH' && key !== 'Lainnya' ? parseInt(key) : key], 
                                items: sortedItems 
                              });
                            }
                          });

                          return lineupGroups.sort((a, b) => {
                              if (activeTab === 'TARAWIH') return (a.nights[0] as number || 0) - (b.nights[0] as number || 0);
                              return 0;
                          }).map((group, idx) => {
                            let label = "";
                            if (activeTab === 'TARAWIH') {
                                group.nights.sort((a, b) => (a as number) - (b as number));
                                const ranges: string[] = [];
                                let s = group.nights[0] as number, e = s;
                                for (let i = 1; i <= group.nights.length; i++) {
                                  if (i < group.nights.length && group.nights[i] === e + 1) e = group.nights[i] as number;
                                  else {
                                    ranges.push(s === e ? s.toString() : `${s}-${e}`);
                                    if (i < group.nights.length) s = group.nights[i] as number, e = s;
                                  }
                                }
                                label = `Malam Ke ${ranges.join(', ')}`;
                            } else {
                                label = group.nights[0] as string;
                            }

                            const sortedGroupItems = group.items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99));

                            return (
                              <tr key={idx} className="hover:bg-neutral-50/20 transition-all group">
                                <td className="px-10 py-8 font-black text-[#0b3d2e] whitespace-nowrap text-sm">
                                  {label}
                                </td>
                                <td className="px-10 py-8">
                                  <div className="grid grid-cols-1 gap-2">
                                    {sortedGroupItems.map(it => (
                                      <div key={it.id} className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0 h-4 border-neutral-200 text-neutral-400">
                                          {allTaskTypes.find(t => t.value === it.type)?.label || it.type}
                                        </Badge>
                                        <span className="text-sm font-bold text-slate-700">{it.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                   <div className="flex justify-end gap-2">
                                       {canUpdate && <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-blue-500 hover:bg-blue-50" onClick={() => openEditGroup(group)}><Edit2 className="h-4 w-4" /></Button>}
                                       {canDelete && <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteGroup(group)}><Trash2 className="h-4 w-4" /></Button>}
                                   </div>
                                </td>
                              </tr>
                            );
                          });
                        })()
                      ) : (
                        filteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-50/20 transition-all group">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                                     <UserIcon className="h-6 w-6" />
                                  </div>
                                  <div>
                                     <span className="font-black text-slate-900 block uppercase tracking-tight">{item.name}</span>
                                     <Badge className="mt-1 bg-white border border-neutral-100 text-neutral-400 text-[10px] font-bold py-0 h-5 px-2 rounded-lg">{categories.find(c => c.value === item.category)?.label || item.category}</Badge>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                              <Badge className={`rounded-xl px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none ${item.type === 'KHOTIB' ? 'bg-orange-50 text-orange-600' : item.type.includes('IMAM') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {allTaskTypes.find(t => t.value === item.type)?.label || item.type}
                              </Badge>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-[#0b3d2e]">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                  <span className="text-[10px] text-neutral-400 font-medium italic mt-0.5">{item.description || 'Tanpa keterangan tambahan'}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <div className="flex justify-end gap-2">
                                   {canUpdate && <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-blue-500 hover:bg-blue-50" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>}
                                   {canDelete && <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>}
                               </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden divide-y divide-neutral-50 px-6">
                  {activeTab === 'TARAWIH' ? (
                    (() => {
                      const tarawihOrder: { [key: string]: number } = {
                        'IMAM_TARAWIH': 1, 'BILAL_1': 2, 'BILAL_2': 3, 'KAMILIN': 4, 'DOA_WITIR': 5
                      };

                      const nightGroups: { [key: string]: any[] } = {};
                      filteredData.forEach(item => {
                        const m = item.description?.match(/(\d+)/);
                        const night = m ? m[0] : 'Lainnya';
                        if (!nightGroups[night]) nightGroups[night] = [];
                        nightGroups[night].push(item);
                      });

                      const lineupGroups: { nights: (number|string)[], items: any[] }[] = [];
                      Object.entries(nightGroups).forEach(([key, items]) => {
                        const sortedItems = items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99));
                        const lineupKey = sortedItems.map(it => `${it.type}:${it.name}`).join('|');
                        const existing = lineupGroups.find(g => 
                          g.items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99))
                                 .map(it => `${it.type}:${it.name}`).join('|') === lineupKey
                        );
                        
                        if (existing && activeTab === 'TARAWIH' && key !== 'Lainnya') {
                          existing.nights.push(parseInt(key));
                        } else {
                          lineupGroups.push({ 
                            nights: [activeTab === 'TARAWIH' && key !== 'Lainnya' ? parseInt(key) : key], 
                            items: sortedItems 
                          });
                        }
                      });

                      return lineupGroups.sort((a, b) => {
                          if (activeTab === 'TARAWIH') return (a.nights[0] as number || 0) - (b.nights[0] as number || 0);
                          return 0;
                      }).map((group, idx) => {
                        let label = "";
                        if (activeTab === 'TARAWIH') {
                            group.nights.sort((a, b) => (a as number) - (b as number));
                            const ranges: string[] = [];
                            let s = group.nights[0] as number, e = s;
                            for (let i = 1; i <= group.nights.length; i++) {
                              if (i < group.nights.length && group.nights[i] === e + 1) e = group.nights[i] as number;
                              else {
                                ranges.push(s === e ? s.toString() : `${s}-${e}`);
                                if (i < group.nights.length) s = group.nights[i] as number, e = s;
                              }
                            }
                            label = `Malam Ke ${ranges.join(', ')}`;
                        } else {
                            label = group.nights[0] as string;
                        }

                        const sortedGroupItems = group.items.sort((a, b) => (tarawihOrder[a.type] || 99) - (tarawihOrder[b.type] || 99));

                        return (
                          <div key={idx} className="py-8 space-y-4">
                            <div className="flex justify-between items-start">
                               <h3 className="font-black text-emerald-900 uppercase tracking-tight text-base">{label}</h3>
                               <div className="flex gap-2">
                                  {canUpdate && <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50 rounded-lg" onClick={() => openEditGroup(group)}><Edit2 className="h-4 w-4" /></Button>}
                                  {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 bg-rose-50 rounded-lg" onClick={() => handleDeleteGroup(group)}><Trash2 className="h-4 w-4" /></Button>}
                               </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 italic">
                               {sortedGroupItems.map(it => (
                                  <div key={it.id} className="flex flex-col gap-0.5">
                                     <span className="text-[10px] font-black uppercase text-neutral-400">{allTaskTypes.find(t => t.value === it.type)?.label || it.type}</span>
                                     <span className="text-sm font-bold text-slate-700">{it.name}</span>
                                  </div>
                               ))}
                            </div>
                          </div>
                        )
                      })
                    })()
                  ) : (
                    filteredData.map((item) => (
                      <div key={item.id} className="py-8 space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100"><UserIcon className="h-5 w-5" /></div>
                            <div className="flex-1 min-w-0">
                               <span className="font-black text-slate-900 block uppercase tracking-tight truncate">{item.name}</span>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className={`rounded-lg px-2 py-0 h-4 font-black text-[8px] uppercase tracking-widest border-none ${item.type === 'KHOTIB' ? 'bg-orange-50 text-orange-600' : item.type.includes('IMAM') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {allTaskTypes.find(t => t.value === item.type)?.label || item.type}
                                  </Badge>
                                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{categories.find(c => c.value === item.category)?.label}</span>
                               </div>
                            </div>
                            <div className="flex gap-1">
                               {canUpdate && <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>}
                               {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                         </div>
                         <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col gap-1 italic">
                            <div className="flex items-center gap-2 text-[#0b3d2e]">
                               <Calendar className="h-3 w-3" />
                               <span className="text-xs font-black">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-medium pl-5">{item.description || 'Tanpa keterangan tambahan'}</p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <StatusPopup 
        isOpen={popup.isOpen}
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        description={popup.description}
      />
    </AdminLayout>
  )
}
