# DKM Al-Muhajirin Ragas Grenyang - Website Management System

Sistem manajemen website komprehensif untuk DKM Masjid Jami' Al-Muhajirin Ragas Grenyang dengan frontend publik dan backend admin berbasis role (RBAC).

## 🌟 Fitur Utama

### Frontend Publik
- **Beranda** - Hero section dengan statistik dan informasi terkini
- **Tentang** - Informasi tentang DKM Al-Muhajirin
- **Struktur Organisasi** - Daftar pengurus DKM
- **Jamaah** - Data Kepala Keluarga & Remaja
- **Kaum Dhuafa** - Data Janda, Guru Ngaji, Fakir Miskin, Yatim, Yatim Piatu, Fisabilillah
- **Kegiatan** - Jadwal dan dokumentasi kegiatan
- **Laporan Keuangan** - Grafik & PDF transparansi keuangan
- **Berita/Pengumuman** - Informasi terkini masjid
- **Galeri** - Foto dan video kegiatan
- **Kontak** - Formulir kontak dan informasi

### Backend Admin dengan RBAC
- **Master Admin**: Akses penuh & kelola user
- **Tokoh Masyarakat**: Lihat laporan & kegiatan (read only)
- **Ketua DKM**: Approve kegiatan, berita, laporan keuangan, struktur
- **Sekretaris DKM**: Kelola jamaah, dhuafa, berita, galeri
- **Bendahara DKM**: Input pemasukan & pengeluaran, laporan keuangan
- **RISMA**: Kelola kegiatan & galeri remaja

## 🛠️ Teknologi

### Core Framework
- **Next.js 16** dengan App Router
- **TypeScript 5** untuk type safety
- **Tailwind CSS 4** dengan desain islami
- **shadcn/ui** component library

### Database & Backend
- **Prisma ORM** dengan SQLite
- **NextAuth.js** untuk autentikasi
- **bcryptjs** untuk password hashing
- **Role-Based Access Control (RBAC)**

### UI/UX
- **Responsive Design** (mobile-first)
- **Islamic Design System** dengan warna hijau tema
- **Dark/Light Mode** support
- **Lucide React** icons
- **Recharts** untuk grafik keuangan

## 📁 Struktur Database

```sql
roles                    # Role definitions
users                    # User accounts with RBAC
struktur_organisasi      # Organizational structure
jamaah_kepala_keluarga   # Family heads data
jamaah_remaja           # Youth members data
kaum_dhuafa            # Needy groups data
kegiatan               # Activities/events
keuangan_pemasukan     # Financial income
keuangan_pengeluaran   # Financial expenses
laporan_keuangan       # Financial reports
berita                 # News & announcements
galeri                 # Photo & video gallery
kontak_masuk           # Contact messages
audit_logs             # Activity logs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Bun package manager
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd dkm-almuhajirin
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   bun run db:push
   bun run db:seed
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

6. **Open browser**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/login

## 🔐 Login Credentials

Setelah menjalankan `bun run db:seed`, Anda dapat menggunakan akun berikut:

| Role                | Email                     | Password         |
|---------------------|---------------------------|------------------|
| Master Admin        | admin@almuhajirin.com | Admin234@      |
| Tokoh Masyarakat    | tokoh@almuhajirin.com | Tokoh234   |
| Ketua DKM           | ketua@almuhajirin.com | Ketua234   |
| Sekretaris DKM      | sekretaris@almuhajirin.com | Sekretaris234 |
| Bendahara DKM       | bendahara@almuhajirin.com | Bendahara234 |
| RISMA               | risma@almuhajirin.com | Risma234 |

**⚠️ Penting:** Ganti password default di production environment!

## 📊 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Users Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/[id]` - Get single user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Roles
- `GET /api/admin/roles` - Get all roles
- `POST /api/admin/roles` - Create role

### Activities
- `GET /api/admin/kegiatan` - Get activities
- `POST /api/admin/kegiatan` - Create activity

### Financial
- `GET /api/admin/keuangan` - Get financial data
- `POST /api/admin/keuangan` - Add income/expense

### Reports
- `GET /api/admin/laporan` - Get financial reports with charts
- `POST /api/admin/laporan` - Create financial report
- `GET /api/admin/laporan/export` - Export PDF/HTML report

## 🎨 Design System

### Colors
- **Primary (Islamic Green)**: `oklch(0.45 0.17 145)`
- **Secondary (Warm Sand)**: `oklch(0.94 0.02 65)`
- **Accent (Deep Gold)**: `oklch(0.85 0.08 75)`

### Typography
- **Display**: 3.5rem/4rem (56px/64px)
- **H1**: 2.5rem/3rem (40px/48px)
- **Body**: 1rem/1.5rem (16px/24px)

### Components
- All components use shadcn/ui base
- Custom Islamic-themed variants
- Full responsive design
- Accessibility compliant (WCAG AA)

## 🔧 Development Commands

```bash
# Development
bun run dev              # Start dev server
bun run lint             # Run ESLint
bun run build            # Build for production

# Database
bun run db:push          # Push schema to database
bun run db:generate      # Generate Prisma client
bun run db:seed          # Seed database with sample data
bun run db:reset         # Reset database
```

## 📱 Responsive Breakpoints

- **Mobile**: 375px+
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## 🔒 Security Features

- **Password Hashing** dengan bcryptjs
- **JWT Authentication** dengan NextAuth.js
- **Role-Based Access Control (RBAC)**
- **Input Validation** dengan Zod
- **SQL Injection Prevention** dengan Prisma ORM
- **XSS Protection** dengan React JSX
- **CSRF Protection** dengan NextAuth.js

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Untuk bantuan atau pertanyaan:
- Email: info@almuhajirin.com
- Website: https://almuhajirin.com

---

**DKM Al-Muhajirin Ragas Grenyang**  
*Teknologi untuk kemajuan umat* 🕌