import Link from 'next/link'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram, 
  Youtube,
  Building
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-surface border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Masjid Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 overflow-hidden shadow-sm">
                <img src="/logo.png" alt="Logo Al-Muhajirin" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  DKM Al-Muhajirin
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ragas Grenyang
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              DKM Masjid Jami' Al-Muhajirin berdedikasi untuk melayani kebutuhan spiritual dan sosial jamaah serta masyarakat sekitar.
            </p>
            <div className="flex space-x-3">
              <Link 
                href="#" 
                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link 
                href="#" 
                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link 
                href="#" 
                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tentang" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/struktur" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Struktur Organisasi
                </Link>
              </li>
              <li>
                <Link href="/kegiatan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/laporan" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Laporan Keuangan
                </Link>
              </li>
              <li>
                <Link href="/berita" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Berita & Pengumuman
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jamaah/kepala-keluarga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Data Kepala Keluarga
                </Link>
              </li>
              <li>
                <Link href="/jamaah/remaja" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Data Remaja Masjid
                </Link>
              </li>
              <li>
                <Link href="/dhuafa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Kaum Dhuafa
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Galeri Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Kontak Kami</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Jl. Ragas Grenyang No. 123<br />
                    Kec. Ragajaya, Kab. Bogor<br />
                    Jawa Barat 16913
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  (0251) 1234-5678
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  info@almuhajirin.com
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Admin Office:</strong><br />
                    Senin - Jumat: 08:00 - 16:00<br />
                    Sabtu: 08:00 - 12:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DKM Al-Muhajirin Ragas Grenyang. Hak Cipta Dilindungi.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}