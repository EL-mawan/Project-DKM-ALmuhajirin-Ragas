'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Users,
  Heart,
  Image,
  Phone,
  ArrowRight,
  Clock,
  MapPin,
  Gift,
  BookOpen,
  HandHelping,
  Building,
  Star,
  TrendingUp,
  Mail
} from 'lucide-react'
import Link from 'next/link'

import { cn, formatCurrency } from '@/lib/utils'

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/stats')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const stats = [
    { icon: Users, label: 'Keluarga', value: data?.stats?.jamaahKK ? `${data.stats.jamaahKK}+` : '0+', desc: 'Kepala Keluarga', color: 'text-blue-500' },
    { icon: Heart, label: 'Remaja', value: data?.stats?.jamaahRemaja ? `${data.stats.jamaahRemaja}+` : '0+', desc: 'Anggota Aktif', color: 'text-rose-500' },
    { icon: HandHelping, label: 'Bantuan', value: data?.stats?.kaumDhuafa || '0', desc: 'Penerima Manfaat', color: 'text-amber-500' },
    { icon: Star, label: 'Umur', value: '25th', desc: 'Melayani Umat', color: 'text-emerald-500' }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section id="beranda" className="relative min-h-[95vh] flex items-center overflow-hidden bg-background">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          {/* Main Gradient Background */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5 animate-gradient-x" />
          
          {/* Animated Blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[100px] animate-float [animation-delay:2s]" />
          <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[80px] animate-float [animation-delay:4s]" />
          
          {/* Grid Pattern with Animation */}
          <div className="absolute inset-0 islamic-pattern opacity-[0.08]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_80%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 fade-in-up">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm">
                <Building className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Masjid Jami' Al-Muhajirin</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                  Membangun Umat,
                  <br />
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-primary via-primary/80 to-accent">
                    Menebar Rahmat
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Pusat kegiatan spiritual, pendidikan, dan sosial untuk masyarakat Ragas Grenyang. 
                  Mari bersama menebar kebaikan dan mempererat ukhuwah islamiyah.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group" asChild>
                  <Link href="#informasi">
                    <Calendar className="mr-2 h-5 w-5" />
                    Jadwal Kegiatan
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-white/20 backdrop-blur-md bg-white/5 hover:bg-white/10 shadow-lg group" asChild>
                  <Link href="#kontak">
                    <Gift className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    Infaq & Sedekah
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative group perspective-1000">
              <div className="relative z-10 aspect-4/5 rounded-4xl overflow-hidden shadow-2xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-700">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2670&auto=format&fit=crop" 
                  alt="Beautiful Mosque Interior" 
                  className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute bottom-10 left-10 z-20 space-y-2">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30">Hadirin Pekan Ini</Badge>
                  <p className="text-2xl font-bold text-white uppercase tracking-wider">Kajian Rutin</p>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="group relative p-8 rounded-4xl bg-white border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
                <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                   <stat.icon className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className={`p-3 rounded-xl bg-muted/50 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">
                    {loading ? '...' : stat.value}
                  </div>
                  <div className="font-bold text-foreground uppercase tracking-wider text-xs">{stat.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Vision Mission */}
      <section id="profil" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px]">Visi & Misi</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Membangun Peradaban dari Masjid
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kami percaya bahwa masjid bukan sekadar tempat ibadah, melainkan pusat pembinaan 
              karakter dan pemberdayaan sosial bagi seluruh lapisan masyarakat.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              {
                icon: BookOpen,
                title: 'Pendidikan Islam',
                description: 'Program pengkajian Al-Qur\'an, Hadits, dan wawasan keislaman komprehensif untuk melahirkan generasi robbani yang berakhlak mulia.'
              },
              {
                icon: HandHelping,
                title: 'Pemberdayaan Sosial',
                description: 'Inisiatif kemanusiaan mulai dari santunan yatim, dhuafa, hingga program ekonomi umat yang berkelanjutan dan transparan.'
              },
              {
                icon: Building,
                title: 'Fasilitas Modern',
                description: 'Penyediaan sarana ibadah yang bersih, nyaman, dan inklusif bagi difabel serta fasilitas pendukung kegiatan masyarakat lainnya.'
              }
            ].map((item, index) => (
              <div key={index} className="group p-10 rounded-[2.5rem] bg-background border border-border/50 hover:bg-primary/2 hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule / Activities */}
      <section id="informasi" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-4">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px]">Agenda Masjid</Badge>
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Kegiatan Mendatang
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Bergabunglah dalam rangkaian kegiatan yang kami selenggarakan untuk meningkatkan iman dan ketaqwaan.
              </p>
            </div>
            <Button variant="ghost" className="rounded-full hover:bg-primary/5 hover:text-primary group">
              Lihat Kalender Kerja
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-4xl bg-muted animate-pulse" />
              ))
            ) : data?.kegiatan?.length > 0 ? (
              data.kegiatan.map((activity: any, index: number) => (
                <div key={index} className="group relative bg-background rounded-4xl border border-border/50 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-16/10 relative overflow-hidden">
                    <img 
                      src={activity.image || 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2670&auto=format&fit=crop'} 
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold border-none capitalize">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Calendar className="mr-3 h-4 w-4 text-primary" />
                        {new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <Clock className="mr-3 h-4 w-4 text-primary" />
                        {new Date(activity.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                        <MapPin className="mr-3 h-4 w-4 text-primary" />
                        {activity.location || 'Masjid Jami\' Al-Muhajirin'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">Belum ada kegiatan mendatang.</p>
            )}
          </div>
        </div>
      </section>

      {/* Financial Transparency */}
      <section id="layanan" className="py-24 bg-primary/2 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] -translate-y-1/2" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6 mb-16">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px]">Transparansi</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Amanah & Profesional
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kami berkomitmen untuk mengelola dana umat dengan penuh tanggung jawab, 
              kejujuran, dan transparansi yang dapat diakses oleh seluruh jamaah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { label: 'Pemasukan Total', value: loading ? '...' : formatCurrency(data?.keuangan?.totalIncome || 0), delta: '+12%', color: 'text-emerald-500' },
              { label: 'Pengeluaran Total', value: loading ? '...' : formatCurrency(data?.keuangan?.totalExpense || 0), delta: '+8%', color: 'text-amber-500' },
              { label: 'Saldo Kas Masjid', value: loading ? '...' : formatCurrency(data?.keuangan?.balance || 0), delta: 'Stabil', color: 'text-primary' }
            ].map((item, index) => (
              <div key={index} className="p-10 rounded-[2.5rem] bg-background border border-border/50 shadow-xl shadow-primary/5 relative group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className={`text-4xl font-black mb-2 tracking-tighter ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</div>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <TrendingUp className={`h-4 w-4 ${item.color}`} />
                  <span className={`text-sm font-semibold ${item.color}`}>{item.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeri" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary uppercase tracking-[0.2em] text-[10px]">Dokumentasi</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Lensa Kegiatan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Momen-momen berharga dalam membangun kebersamaan dan peradaban umat di Ragas Grenyang.</p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4 mb-12">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-3xl animate-pulse" />
              ))
            ) : data?.galeri?.length > 0 ? (
              data.galeri.map((item: any, i: number) => (
                <div key={i} className="relative group overflow-hidden rounded-3xl cursor-pointer">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                     <Image className="text-white w-10 h-10" />
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <img key={i} src={`https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2670&auto=format&fit=crop`} alt={`Placeholder ${i}`} className="rounded-3xl" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                  Mari Berdiskusi & <br /> Berkolaborasi
                </h2>
                <p className="text-xl text-white/80 leading-relaxed">
                  Pintu kami selalu terbuka untuk aspirasi, saran, and pertanyaan Anda. 
                  Hubungi kami kapan saja untuk layanan jamaah yang lebih baik.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-2xl shadow-2xl">
                    <Phone className="mr-2 h-5 w-5" />
                    WhatsApp Layanan
                  </Button>
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 rounded-2xl">
                    <Mail className="mr-2 h-5 w-5" />
                    Kirim Email
                  </Button>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-4xl p-8 border border-white/20 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">Nama Lengkap</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder="Arwan ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">Email</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder="arwan@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">Pesan Anda</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all min-h-[120px]" placeholder="Apa yang bisa kami bantu?"></textarea>
                </div>
                <Button className="w-full bg-white text-primary font-bold py-6 rounded-xl">
                  Kirim Pesan Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}