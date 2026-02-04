/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('--- DATABASE HEALTH CHECK ---');
  try {
    // 1. Check Connection
    await prisma.$connect();
    console.log('✅ Connection: SUCCESS');

    // 2. Database Info
    const dbSize = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
    const pgVersion = await prisma.$queryRaw`SELECT version()`;
    console.log('📍 Database Size:', dbSize[0].size);
    console.log('📍 Engine Version:', pgVersion[0].version.split(',')[0]);

    // 3. Model Counts
    console.log('\n--- MODEL STATISTICS ---');
    const models = [
      { name: 'User', model: prisma.user },
      { name: 'Role', model: prisma.role },
      { name: 'JadwalTugas', model: prisma.jadwalTugas },
      { name: 'DokumenResmi', model: prisma.dokumenResmi },
      { name: 'JamaahKK', model: prisma.jamaahKepalaKeluarga },
      { name: 'Kegiatan', model: prisma.kegiatan },
      { name: 'KeuanganIn', model: prisma.keuanganPemasukan },
      { name: 'KeuanganOut', model: prisma.keuanganPengeluaran },
      { name: 'AuditLog', model: prisma.auditLog },
    ];

    for (const m of models) {
      if (m.model) {
        try {
          const count = await m.model.count();
          console.log(` - ${m.name.padEnd(15)}: ${count} records`);
        } catch (err) {
          console.log(` ❌ ${m.name.padEnd(15)}: ERROR (${err.message.split('\n')[0]})`);
        }
      } else {
        console.log(` ⚠️ ${m.name.padEnd(15)}: MODEL NOT FOUND in Client`);
      }
    }

    // 4. Detailed Check for JadwalTugas (the recently added table)
    console.log('\n--- JADWAL TUGAS DETAIL ---');
    if (prisma.jadwalTugas) {
        const latest = await prisma.jadwalTugas.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' }
        });
        if (latest.length > 0) {
            console.log('Latest 3 entries:');
            latest.forEach(j => {
                console.log(` - [${j.category}] ${j.type} for ${j.name} on ${j.date.toISOString().split('T')[0]}`);
            });
        } else {
            console.log('No entries found in JadwalTugas.');
        }
    }

    console.log('\n-----------------------');
  } catch (e) {
    console.error('❌ CRITICAL ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
