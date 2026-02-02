'use client'

import React from 'react'

export interface Pimpinan {
  role: string
  name: string
}

export interface RABItem {
  nama: string
  spesifikasi: string
  jumlah: number
  satuan: string
  hargaSatuan: number
  totalHarga: number
}

export interface ProposalFoto {
  url: string
  deskripsi: string
}

export interface ProposalData {
  nomor: string
  lampiran: string
  perihal: string
  penerima: {
    nama: string
    jabatan: string
    instansi: string
    alamat: string
  }
  latarBelakang: string
  suratPengantar: string
  tujuan: string[]
  struktur: {
    pimpinanAtas: Pimpinan[]
    administrasi: Pimpinan[]
    operasional: string[]
  }
  rab: RABItem[]
  tanggal: string
  tempat: string
  namaKetua: string
  namaSekretaris: string
  namaBendahara: string
  namaTokohMasyarakat: string
  namaKetuaRW: string
  namaKetuaRT: string
  namaKetuaPemuda: string
  namaKepalaDesa: string
  logoKiri?: string
  logoKanan?: string
  namaKopSurat: string
  alamatKopSurat: string
  kontakKopSurat: string
  penutup: string
  lampiranFoto: ProposalFoto[]
  waktuKegiatan: string
  tempatKegiatan: string
  showWaktuTempat: boolean
}

export function PageWrapper({ children, data, pageNumber }: { children: React.ReactNode, data: Partial<ProposalData>, pageNumber?: number }) {
    return (
       <div className="proposal-page relative flex flex-col shadow-2xl" 
            style={{ 
              width: '794px', 
              height: '1123px', 
              padding: '40px 60px', 
              boxSizing: 'border-box',
              background: 'white',
              margin: '0 auto',
              color: 'black',
              position: 'relative',
              overflow: 'hidden'
            }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <img src={data.logoKiri || "/logo.png"} alt="Logo Kiri" crossOrigin="anonymous" style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                <h1 style={{ fontWeight: '900', fontSize: '16pt', margin: '0', textTransform: 'uppercase', color: '#0b3d2e', letterSpacing: '0.5px' }}>{data.namaKopSurat}</h1>
                <p style={{ fontSize: '10pt', margin: '5px 0', whiteSpace: 'pre-line', color: '#334155', fontWeight: '500' }}>{data.alamatKopSurat}</p>
                <p style={{ fontSize: '9pt', margin: '0', fontStyle: 'italic', color: '#64748b' }}>{data.kontakKopSurat}</p>
            </div>
            {data.logoKanan && (
                <img src={data.logoKanan} alt="Logo Kanan" crossOrigin="anonymous" style={{ width: '85px', height: '85px', objectFit: 'contain' }} />
            )}
            {!data.logoKanan && <div style={{ width: '85px' }} />}
        </div>
        
        <div style={{ height: '2.5px', background: '#0b3d2e', marginBottom: '1px' }}></div>
        <div style={{ height: '0.8px', background: '#0b3d2e' }}></div>

        <div style={{ flex: 1, marginTop: '25px', position: 'relative' }}>
          {children}
        </div>

        {/* Footer Accent */}
        <div style={{ 
          position: 'absolute', 
          bottom: '40px', 
          left: '60px', 
          right: '60px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '12px',
          fontSize: '9pt',
          color: '#64748b',
          fontWeight: '500'
        }}>
          <span>DKM Al-Muhajirin Ragas Grenyang</span>
          {pageNumber !== undefined && (
            <span style={{ color: '#0b3d2e', fontWeight: '800' }}>Halaman {pageNumber} dari {data.lampiranFoto && data.lampiranFoto.length > 0 ? '6' : '5'}</span>
          )}
        </div>
      </div>
    )
}

export function PageCover({ data }: { data: Partial<ProposalData> }) {
    return (
        <div className="proposal-page relative flex flex-col items-center justify-between" 
             style={{ 
               width: '794px', 
               height: '1123px', 
               padding: '40px 60px', 
               boxSizing: 'border-box',
               margin: '0 auto',
               background: 'white',
               position: 'relative'
             }}>
            
            {/* Centered Logo for Cover */}
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '40px', zIndex: 2 }}>
                <img src={data.logoKiri || "/logo.png"} alt="Logo" crossOrigin="anonymous" style={{ width: '150px', height: '150px', objectFit: 'contain', margin: '0 auto' }} />
            </div>

            <div style={{ position: 'absolute', top: 0, right: 0, width: '450px', height: '450px', background: 'radial-gradient(circle at top right, #f0fdf4 0%, transparent 70%)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '450px', height: '450px', background: 'radial-gradient(circle at bottom left, #ecfdf5 0%, transparent 70%)', zIndex: 0, opacity: 0.8 }}></div>

            <div style={{ zIndex: 2, textAlign: 'center', width: '100%', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '14pt', fontWeight: 'bold', letterSpacing: '8px', color: '#64748b', margin: '0 0 15px 0', textTransform: 'uppercase' }}>PROPOSAL</p>
                    <div style={{ width: '60px', height: '4px', background: '#0b3d2e', margin: '0 auto' }}></div>
                </div>
                
                <h1 style={{ 
                    fontWeight: '900', 
                    fontSize: '24pt', 
                    margin: '0 0 25px 0', 
                    textTransform: 'uppercase', 
                    color: '#0f172a', 
                    lineHeight: '1.2'
                }}>
                    {data.perihal || 'Judul Proposal'}
                </h1>
                
                <div style={{ margin: '30px auto', maxWidth: '520px', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '30px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '10pt', margin: '0 0 15px 0', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Diajukan Oleh:</p>
                    <p style={{ fontSize: '16pt', fontWeight: '900', margin: '0', textTransform: 'uppercase', color: '#0b3d2e', lineHeight: '1.3' }}>{data.namaKopSurat}</p>
                    <div style={{ height: '2px', width: '100px', backgroundColor: '#cbd5e1', margin: '20px auto' }}></div>
                    <p style={{ fontSize: '11pt', color: '#475569', fontWeight: '500', lineHeight: '1.5' }}>
                        Kampung Ragas Grenyang, Desa Argawana<br/>
                        Kecamatan Puloampel Kabupaten Serang - Banten
                    </p>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <p style={{ fontSize: '14pt', fontWeight: '900', letterSpacing: '10px', color: '#0f172a', margin: '0' }}>TAHUN {new Date().getFullYear()}</p>
                </div>
            </div>
        </div>
    )
}

export function Page1({ data, bulkRecipient, onNavigate }: { data: Partial<ProposalData>, bulkRecipient?: any, onNavigate?: (tab: string) => void }) {
    const recipient = bulkRecipient || data.penerima || { nama: '', jabatan: '', instansi: '', alamat: '' }
    return (
        <PageWrapper data={data} pageNumber={1}>
            <div style={{ fontSize: '12pt' }}>
                <table style={{ width: '100%', marginBottom: '25px' }}>
                    <tbody>
                        <tr><td style={{ width: '100px', color: '#64748b', fontSize: '11pt' }}>Nomor</td><td style={{ width: '15px' }}>:</td><td style={{ fontWeight: 'bold' }}>{data.nomor || '___/___/___/___'}</td></tr>
                        <tr><td style={{ color: '#64748b', fontSize: '11pt' }}>Lampiran</td><td>:</td><td>{data.lampiran}</td></tr>
                        <tr><td style={{ color: '#64748b', fontSize: '11pt' }}>Perihal</td><td>:</td><td style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#0b3d2e' }}>{data.perihal}</td></tr>
                    </tbody>
                </table>

                <div style={{ marginBottom: '25px' }}>
                    <p style={{ marginBottom: '8px' }}>Kepada Yth.</p>
                    <p style={{ fontWeight: '900', fontSize: '14pt', margin: '0', color: '#0f172a' }}>{recipient.nama || '........................'}</p>
                    {recipient.jabatan && <p style={{ fontWeight: '700', color: '#475569', fontSize: '11pt', margin: '2px 0' }}>{recipient.jabatan}</p>}
                    {recipient.instansi && <p style={{ fontWeight: '700', color: '#475569', fontSize: '11pt', margin: '2px 0' }}>{recipient.instansi}</p>}
                    <p style={{ marginTop: '10px', color: '#64748b' }}>di -</p>
                    <p style={{ paddingLeft: '20px', fontWeight: 'bold', fontSize: '13pt' }}>{recipient.alamat || 'Tempat'}</p>
                </div>

                <div style={{ textAlign: 'justify', marginBottom: '30px', lineHeight: '1.6' }}>
                    {data.suratPengantar?.split('\n').map((line, i) => (
                        <p key={i} style={{ textIndent: i > 0 ? '40px' : '0', marginBottom: '8px' }}>{line}</p>
                    ))}
                </div>

                <div style={{ textAlign: 'right', marginBottom: '30px' }}>
                    <p style={{ fontWeight: '700' }}>{data.tempat}, {data.tanggal}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center', marginBottom: '25px' }}>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontWeight: '900', fontSize: '11pt', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' }}>Ketua DKM,</p>
                        <div style={{ height: '65px' }}></div>
                        <p style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '11pt', color: '#0f172a' }}>{data.namaKetua || '( ........................ )'}</p>
                    </div>

                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontWeight: '900', fontSize: '11pt', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' }}>Sekretaris DKM,</p>
                        <div style={{ height: '65px' }}></div>
                        <p style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '11pt', color: '#0f172a' }}>{data.namaSekretaris || '( ........................ )'}</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '10pt', margin: '0 0 5px 0', fontWeight: 'bold', color: '#64748b' }}>Mengetahui,</p>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer', display: 'inline-block' }}>
                        <p style={{ fontWeight: '900', fontSize: '12pt', margin: '0', color: '#0b3d2e' }}>Tokoh Masyarakat Masjid Al-Muhajirin</p>
                        <div style={{ height: '60px' }}></div>
                        <p style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '11pt' }}>{data.namaTokohMasyarakat || '( ........................ )'}</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export function Page2({ data }: { data: Partial<ProposalData> }) {
    return (
        <PageWrapper data={data} pageNumber={2}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: '900', borderLeft: '10px solid #0b3d2e', paddingLeft: '20px', marginBottom: '25px', textTransform: 'uppercase', color: '#0b3d2e' }}>I. Pendahuluan</h2>
                
                <h3 style={{ fontWeight: '900', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', fontSize: '10pt' }}>1.1 Latar Belakang</h3>
                <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '25px', lineHeight: '1.6', color: '#0f172a' }}>{data.latarBelakang}</div>

                <h3 style={{ fontWeight: '900', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', fontSize: '10pt' }}>1.2 Maksud dan Tujuan</h3>
                <ul style={{ paddingLeft: '40px', marginBottom: '25px', lineHeight: '1.6', color: '#0f172a' }}>
                    {data.tujuan?.map((t, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>{t}</li>
                    ))}
                </ul>

                {data.showWaktuTempat && (
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ fontWeight: '900', color: '#334155', marginBottom: '15px', textTransform: 'uppercase', fontSize: '10pt' }}>1.3 Waktu dan Tempat</h3>
                        <div style={{ paddingLeft: '15px', lineHeight: '1.8', color: '#0f172a' }}>
                            <p style={{ marginBottom: '12px' }}>Insha Allah kegiatan ini akan dilaksanakan pada:</p>
                            <table style={{ width: '100%', marginBottom: '15px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '150px', fontWeight: '900', color: '#475569' }}>Hari / Tanggal</td>
                                        <td style={{ width: '20px' }}>:</td>
                                        <td style={{ fontWeight: '700' }}>{data.waktuKegiatan || '........................'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: '900', color: '#475569' }}>Tempat</td>
                                        <td>:</td>
                                        <td style={{ fontWeight: '700' }}>{data.tempatKegiatan || '........................'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    )
}

export function Page3({ data }: { data: Partial<ProposalData> }) {
    return (
        <PageWrapper data={data} pageNumber={3}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '18pt', fontWeight: '900', borderLeft: '12px solid #0b3d2e', paddingLeft: '25px', marginBottom: '40px', textTransform: 'uppercase', color: '#0b3d2e', letterSpacing: '1px' }}>II. Struktur Organisasi</h2>
                
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '2px', background: '#e2e8f0', marginRight: '15px' }}></div>
                        <h3 style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11pt', color: '#475569', letterSpacing: '2px', margin: '0' }}>Pimpinan Utama</h3>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9', marginLeft: '15px' }}></div>
                    </div>
                    {data.struktur?.pimpinanAtas.map((p, i) => (
                        <div key={i} style={{ display: 'flex', paddingLeft: '20px', marginBottom: '12px', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                            <span style={{ fontWeight: '900', width: '220px', color: '#334155' }}>{p.role}</span>
                            <span style={{ margin: '0 15px', color: '#cbd5e1' }}>:</span>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{p.name || '........................'}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '2px', background: '#e2e8f0', marginRight: '15px' }}></div>
                        <h3 style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11pt', color: '#475569', letterSpacing: '2px', margin: '0' }}>Administrasi & Keuangan</h3>
                        <div style={{ flex: 1, height: '1px', background: '#f1f5f9', marginLeft: '15px' }}></div>
                    </div>
                    {data.struktur?.administrasi.map((p, i) => (
                        <div key={i} style={{ display: 'flex', paddingLeft: '20px', marginBottom: '12px', borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                            <span style={{ fontWeight: '900', width: '220px', color: '#334155' }}>{p.role}</span>
                            <span style={{ margin: '0 15px', color: '#cbd5e1' }}>:</span>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{p.name || '........................'}</span>
                        </div>
                    ))}
                </div>

                {data.struktur?.operasional && data.struktur.operasional.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '2px', background: '#e2e8f0', marginRight: '15px' }}></div>
                            <h3 style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '11pt', color: '#475569', letterSpacing: '2px', margin: '0' }}>Seksi Operasional</h3>
                            <div style={{ flex: 1, height: '1px', background: '#f1f5f9', marginLeft: '15px' }}></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingLeft: '20px' }}>
                            {data.struktur.operasional.map((op, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#0f172a', fontWeight: '600' }}>
                                    <span style={{ color: '#0b3d2e', marginRight: '10px', fontSize: '14pt' }}>•</span> {op}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    )
}

export function Page4({ data }: { data: Partial<ProposalData> }) {
    const total = data.rab?.reduce((acc, curr) => acc + curr.totalHarga, 0) || 0
    return (
        <PageWrapper data={data} pageNumber={4}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: '900', borderLeft: '10px solid #0b3d2e', paddingLeft: '20px', marginBottom: '25px', textTransform: 'uppercase', color: '#0b3d2e' }}>III. Rencana Anggaran Biaya</h2>
                
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0b3d2e', color: 'white' }}>
                            <th style={{ padding: '18px 15px', textAlign: 'left', borderRadius: '15px 0 0 15px', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Uraian Item</th>
                            <th style={{ padding: '18px 15px', textAlign: 'center', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Qty</th>
                            <th style={{ padding: '18px 15px', textAlign: 'right', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Harga</th>
                            <th style={{ padding: '18px 15px', textAlign: 'right', borderRadius: '0 15px 15px 0', fontSize: '10pt', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rab?.map((item, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', borderRadius: '15px 0 0 15px' }}>
                                    <p style={{ fontWeight: '900', color: '#0f172a', margin: '0', fontSize: '11pt' }}>{item.nama}</p>
                                    <p style={{ fontSize: '9pt', color: '#64748b', margin: '6px 0 0 0', fontStyle: 'italic' }}>{item.spesifikasi}</p>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontWeight: '700' }}>{item.jumlah} {item.satuan}</td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#475569' }}>Rp {item.hargaSatuan?.toLocaleString('id-ID')}</td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '900', color: '#059669', borderRadius: '0 15px 15px 0' }}>Rp {item.totalHarga?.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr><td colSpan={4} style={{ height: '20px' }}></td></tr>
                        <tr style={{ backgroundColor: '#f0fdf4' }}>
                            <td colSpan={3} style={{ padding: '15px 25px', textAlign: 'right', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#064e3b', borderRadius: '15px 0 0 15px', fontSize: '10pt' }}>Total Estimasi Biaya :</td>
                            <td style={{ padding: '15px 25px', textAlign: 'right', fontSize: '16pt', fontWeight: '1000', color: '#0b3d2e', borderRadius: '0 15px 15px 0' }}>Rp {total.toLocaleString('id-ID')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </PageWrapper>
    )
}

export function Page5({ data, onNavigate }: { data: Partial<ProposalData>, onNavigate?: (tab: string) => void }) {
    return (
        <PageWrapper data={data} pageNumber={5}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '16pt', fontWeight: '900', borderLeft: '10px solid #0b3d2e', paddingLeft: '20px', marginBottom: '25px', textTransform: 'uppercase', color: '#0b3d2e' }}>IV. Penutup</h2>
                <div style={{ textAlign: 'justify', textIndent: '40px', marginBottom: '25px', lineHeight: '1.7', color: '#0f172a' }}>{data.penutup}</div>

                <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                    <p style={{ fontStyle: 'italic', fontWeight: '900', color: '#475569', fontSize: '11pt' }}>{data.tempat}, {data.tanggal}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', textAlign: 'center', marginBottom: '25px' }}>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '10pt', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' }}>Sekretaris DKM,</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '11pt', color: '#0f172a' }}>{data.namaSekretaris || '( ........................ )'}</p>
                    </div>

                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '10pt', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' }}>Ketua DKM,</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontWeight: '900', textDecoration: 'underline', fontSize: '11pt', color: '#0f172a' }}>{data.namaKetua || '( ........................ )'}</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'inline-block', borderBottom: '3px solid #0b3d2e', paddingBottom: '8px' }}>
                        <p style={{ fontWeight: '1000', fontSize: '14pt', textTransform: 'uppercase', letterSpacing: '5px', color: '#0b3d2e', margin: '0' }}>Mengetahui,</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '35px 40px', textAlign: 'center' }}>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '11pt', fontWeight: '900', color: '#334155' }}>Ketua RT 015,</p>
                        <p style={{ fontSize: '10pt', fontStyle: 'italic', color: '#64748b' }}>Kampung Ragas Grenyang</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: '900', textDecoration: 'underline' }}>{data.namaKetuaRT || '( ........................ )'}</p>
                    </div>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '11pt', fontWeight: '900', color: '#334155' }}>Ketua RW 008,</p>
                        <p style={{ fontSize: '10pt', fontStyle: 'italic', color: '#64748b' }}>Kampung Ragas Grenyang</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontSize: '11pt', fontWeight: '900', textDecoration: 'underline' }}>{data.namaKetuaRW || '( ........................ )'}</p>
                    </div>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '12pt', fontWeight: '900', color: '#064e3b' }}>Tokoh Masyarakat,</p>
                        <p style={{ fontSize: '11pt', fontStyle: 'italic', color: '#059669' }}>Masjid Al-Muhajirin</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontWeight: '1000', textDecoration: 'underline', fontSize: '12pt' }}>{data.namaTokohMasyarakat || '( ........................ )'}</p>
                    </div>
                    <div onClick={() => onNavigate?.('struktur')} style={{ cursor: 'pointer' }}>
                        <p style={{ fontSize: '11pt', fontWeight: '900', color: '#334155' }}>Ketua Pemuda,</p>
                        <p style={{ fontSize: '10pt', fontStyle: 'italic', color: '#64748b' }}>Kampung Ragas Grenyang</p>
                        <div style={{ height: '55px' }}></div>
                        <p style={{ fontSize: '11pt', textDecoration: 'underline', fontWeight: '900' }}>{data.namaKetuaPemuda || '( ........................ )'}</p>
                    </div>

                    {data.namaKepalaDesa && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '15px', cursor: 'pointer' }}>
                            <div style={{ width: '300px', margin: '0 auto' }}>
                                <p style={{ fontSize: '12pt', fontWeight: '900', color: '#0f172a' }}>Kepala Desa Argawana,</p>
                                <div style={{ height: '60px' }}></div>
                                <p style={{ fontSize: '12pt', fontWeight: '900', textDecoration: 'underline', color: '#0f172a' }}>{data.namaKepalaDesa}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export function Page6({ data }: { data: Partial<ProposalData> }) {
    return (
        <PageWrapper data={data} pageNumber={6}>
            <div style={{ fontSize: '12pt' }}>
                <h2 style={{ fontSize: '18pt', fontWeight: '900', borderLeft: '12px solid #0b3d2e', paddingLeft: '25px', marginBottom: '40px', textTransform: 'uppercase', color: '#0b3d2e', letterSpacing: '1px' }}>V. Lampiran Dokumentasi</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                    {data.lampiranFoto?.map((foto, i) => (
                        <div key={i} style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '25px', border: '1px solid #f1f5f9' }}>
                            <div style={{ width: '100%', height: '220px', backgroundColor: '#e2e8f0', borderRadius: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                                {foto.url ? <img src={foto.url} alt={`Foto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8', fontSize: '10pt' }}>Tidak ada foto</span>}
                            </div>
                            <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '11pt', fontWeight: '700', color: '#334155' }}>{foto.deskripsi || `Keterangan Foto ${i + 1}`}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageWrapper>
    )
}
