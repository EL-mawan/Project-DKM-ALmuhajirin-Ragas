# 🚀 Deployment Guide - Vercel

## Prerequisites
- ✅ GitHub repository: `EL-mawan/Project-DKM-ALmuhajirin-Ragas`
- ✅ Neon PostgreSQL database (sudah setup)
- ✅ Vercel account

## Step-by-Step Deployment

### 1. Import Project ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login
2. Klik **"Add New"** → **"Project"**
3. Pilih repository: **"Project-DKM-ALmuhajirin-Ragas"**
4. Klik **"Import"**

### 2. Configure Project Settings

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (default)
**Build Command**: `npm run build` (default)
**Output Directory**: `.next` (default)

### 3. Set Environment Variables

Sebelum deploy, tambahkan environment variables berikut di Vercel:

#### **DATABASE_URL** (Required)
```
postgresql://neondb_owner:npg_RMqb8da2BTEX@ep-holy-flower-a1alhjqe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### **DIRECT_URL** (Required)
```
postgresql://neondb_owner:npg_RMqb8da2BTEX@ep-holy-flower-a1alhjqe.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### **NEXTAUTH_SECRET** (Required)
```
HpdsD+ZVh8g+2+yi/j91Ja7FDLhbNSlu1dLopJG9IE0=
```

#### **NEXTAUTH_URL** (Required)
```
https://dkm-almuhajirin-ragas.vercel.app
```

> **Note**: Ganti URL di atas dengan domain Vercel Anda yang sebenarnya setelah deployment pertama.

### 4. Deploy

1. Klik **"Deploy"**
2. Tunggu proses build selesai (~2-3 menit)
3. Vercel akan otomatis:
   - Install dependencies
   - Run `prisma generate`
   - Build Next.js app
   - Deploy ke production

### 5. Update NEXTAUTH_URL (Penting!)

Setelah deployment pertama selesai:

1. Copy URL production Anda (misal: `https://dkm-almuhajirin-ragas.vercel.app`)
2. Buka **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` dengan URL production yang benar
4. Klik **"Save"**
5. Trigger **Redeploy** dari tab **Deployments**

### 6. Test Login

1. Buka `https://dkm-almuhajirin-ragas.vercel.app/login`
2. Login dengan kredensial:
   - **Email**: `admin@almuhajirin.com`
   - **Password**: `Admin234@`
3. Anda akan diarahkan ke dashboard admin

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Master Admin | admin@almuhajirin.com | Admin234@ |
| Tokoh Masyarakat | tokoh@almuhajirin.com | Tokoh234 |
| Ketua DKM | ketua@almuhajirin.com | Ketua234 |
| Sekretaris DKM | sekretaris@almuhajirin.com | Sekretaris234 |
| Bendahara DKM | bendahara@almuhajirin.com | Bendahara234 |
| RISMA | risma@almuhajirin.com | Risma234 |

> ⚠️ **PENTING**: Segera ganti password default setelah deployment!

## 🔧 Troubleshooting

### Build Failed
- Check environment variables sudah lengkap
- Pastikan `DATABASE_URL` dan `DIRECT_URL` benar
- Lihat build logs di Vercel dashboard

### Login Tidak Berfungsi
- Pastikan `NEXTAUTH_URL` sesuai dengan domain production
- Pastikan `NEXTAUTH_SECRET` sudah diset
- Check browser console untuk error

### Database Connection Error
- Verifikasi Neon database masih aktif
- Check connection string masih valid
- Pastikan IP Vercel tidak di-block oleh Neon

## 📝 Post-Deployment Checklist

- [ ] Test login dengan semua role
- [ ] Ganti password default
- [ ] Test CRUD operations (Jamaah, Keuangan, dll)
- [ ] Test upload gambar (jika ada)
- [ ] Setup custom domain (optional)
- [ ] Enable analytics di Vercel (optional)
- [ ] Setup monitoring/alerts

## 🎯 Custom Domain (Optional)

Jika ingin menggunakan domain sendiri (misal: `masjid-almuhajirin.org`):

1. Buka **Settings** → **Domains**
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel
4. Update `NEXTAUTH_URL` dengan domain baru
5. Redeploy

## 🔄 Auto-Deploy

Setiap kali Anda `git push` ke branch `main`, Vercel akan otomatis:
- Pull latest code
- Run build
- Deploy ke production

## 📞 Support

Jika ada masalah saat deployment, hubungi:
- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/docs
