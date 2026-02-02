/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSize() {
  try {
    const auditCount = await prisma.auditLog.count();
    const docCount = await prisma.dokumenResmi.count();
    const userCount = await prisma.user.count();
    const keluargaCount = await prisma.jamaahKepalaKeluarga.count();
    
    // Get DB size if possible
    const dbSize = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;

    console.log('--- DATABASE STATUS ---');
    console.log('Total Database Size:', dbSize[0].size);
    console.log('Row Counts:');
    console.log(' - Audit Logs:', auditCount);
    console.log(' - Dokumen Resmi:', docCount);
    console.log(' - Kepala Keluarga:', keluargaCount);
    console.log(' - Users:', userCount);
    console.log('-----------------------');
  } catch (e) {
    console.error('Error fetching stats:', e);
  } finally {
    await prisma.$disconnect();
  }
}

checkSize();
