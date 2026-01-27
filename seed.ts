import { PrismaClient } from '@prisma/client'
import { hashPassword } from './src/lib/auth/password'
import { ROLE_CONFIGS } from './src/lib/auth/rbac'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create roles
  console.log('📋 Creating roles...')
  for (const [roleKey, roleConfig] of Object.entries(ROLE_CONFIGS)) {
    await prisma.role.upsert({
      where: { name: roleConfig.name },
      update: {
        description: roleConfig.description,
        permissions: JSON.stringify(roleConfig.permissions)
      },
      create: {
        name: roleConfig.name,
        description: roleConfig.description,
        permissions: JSON.stringify(roleConfig.permissions)
      }
    })
    console.log(`✅ Created role: ${roleConfig.name}`)
  }

  // Create master admin user
  console.log('👤 Creating master admin user...')
  const masterAdminRole = await prisma.role.findUnique({
    where: { name: 'Master Admin' }
  })

  if (masterAdminRole) {
    const hashedPassword = await hashPassword('Admin234@')
    
    await prisma.user.upsert({
      where: { email: 'admin@almuhajirin.com' },
      update: {
        name: 'Master Admin',
        password: hashedPassword,
        roleId: masterAdminRole.id,
        isActive: true
      },
      create: {
        email: 'admin@almuhajirin.com',
        name: 'Master Admin',
        password: hashedPassword,
        roleId: masterAdminRole.id,
        isActive: true
      }
    })
    console.log('✅ Created master admin user: admin@almuhajirin.com')
  }

  // Create sample users for other roles
  console.log('👥 Creating sample users...')
  
  const otherRoles = [
    { name: 'Tokoh Masyarakat', email: 'tokoh@almuhajirin.com', userName: 'Ahmad Wijaya', password: 'Tokoh234' },
    { name: 'Ketua DKM', email: 'ketua@almuhajirin.com', userName: 'Budi Santoso', password: 'Ketua234' },
    { name: 'Sekretaris DKM', email: 'sekretaris@almuhajirin.com', userName: 'Siti Aminah', password: 'Sekretaris234' },
    { name: 'Bendahara DKM', email: 'bendahara@almuhajirin.com', userName: 'Rudi Hartono', password: 'Bendahara234' },
    { name: 'RISMA', email: 'risma@almuhajirin.com', userName: 'Dewi Lestari', password: 'Risma234' }
  ]

  for (const role of otherRoles) {
    const roleRecord = await prisma.role.findUnique({
      where: { name: role.name }
    })

    if (roleRecord) {
      const hashedPassword = await hashPassword(role.password)
      
      await prisma.user.upsert({
        where: { email: role.email },
        update: {
          name: role.userName,
          password: hashedPassword,
          roleId: roleRecord.id,
          isActive: true
        },
        create: {
          email: role.email,
          name: role.userName,
          password: hashedPassword,
          roleId: roleRecord.id,
          isActive: true
        }
      })
      console.log(`✅ Created ${role.name}: ${role.email}`)
    }
  }

  // Create sample organizational structure
  console.log('🏢 Creating organizational structure...')
  const strukturData = [
    {
      name: 'Drs. H. Ahmad Fauzi, M.Pd.I',
      position: 'Ketua DKM',
      description: 'Ketua Dewan Kemakmuran Masjid Jami\' Al-Muhajirin periode 2024-2029',
      order: 1
    },
    {
      name: 'Hj. Siti Aminah, S.Pd.I',
      position: 'Sekretaris DKM',
      description: 'Sekretaris Dewan Kemakmuran Masjid Jami\' Al-Muhajirin',
      order: 2
    },
    {
      name: 'H. Budi Santoso, S.E.',
      position: 'Bendahara DKM',
      description: 'Bendahara Dewan Kemakmuran Masjid Jami\' Al-Muhajirin',
      order: 3
    }
  ]

  for (const struktur of strukturData) {
    await prisma.strukturOrganisasi.upsert({
      where: { 
        id: `struktur-${struktur.order}`
      },
      update: struktur,
      create: {
        ...struktur,
        id: `struktur-${struktur.order}`
      }
    })
    console.log(`✅ Created structure: ${struktur.position}`)
  }

  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('📧 Login Credentials:')
  console.log('Check README.md for the full list of credentials.')
  console.log('')
  console.log('🔐 Please change the default passwords in production!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })