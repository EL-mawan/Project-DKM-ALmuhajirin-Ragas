import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DKM Al-Muhajirin - Kp. RAGAS GRENYANG",
  description: "DKM Al-Muhajirin Kp. RAGAS GRENYANG - Pusat kegiatan spiritual, pendidikan, dan sosial untuk masyarakat. Informasi jadwal, kegiatan, laporan keuangan, dan layanan jamaah.",
  keywords: ["Al-Muhajirin", "Masjid Jami' Al-Muhajirin", "Ragas Grenyang", "Masjid Ragas", "DKM", "Islam", "Jamaah", "Kegiatan Sosial"],
  authors: [{ name: "DKM Al-Muhajirin Kp. RAGAS GRENYANG" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Al-Muhajirin - Masjid Jami' Ragas Grenyang",
    description: "Pusat kegiatan spiritual, pendidikan, dan sosial untuk masyarakat Ragas Grenyang",
    url: "https://almuhajirin.com",
    siteName: "Al-Muhajirin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Al-Muhajirin - Masjid Jami' Ragas Grenyang",
    description: "Pusat kegiatan spiritual, pendidikan, dan sosial untuk masyarakat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
