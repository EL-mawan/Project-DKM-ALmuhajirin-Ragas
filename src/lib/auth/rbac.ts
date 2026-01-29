// Role definitions and permissions for Al-Muhajirin

export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
  description: string
}

// Define all available permissions
export const PERMISSIONS = {
  // User Management
  USER_CREATE: { resource: 'users', action: 'create' },
  USER_READ: { resource: 'users', action: 'read' },
  USER_UPDATE: { resource: 'users', action: 'update' },
  USER_DELETE: { resource: 'users', action: 'delete' },
  
  // Role Management
  ROLE_CREATE: { resource: 'roles', action: 'create' },
  ROLE_READ: { resource: 'roles', action: 'read' },
  ROLE_UPDATE: { resource: 'roles', action: 'update' },
  ROLE_DELETE: { resource: 'roles', action: 'delete' },
  
  // Structure Management
  STRUCTURE_CREATE: { resource: 'struktur', action: 'create' },
  STRUCTURE_READ: { resource: 'struktur', action: 'read' },
  STRUCTURE_UPDATE: { resource: 'struktur', action: 'update' },
  STRUCTURE_DELETE: { resource: 'struktur', action: 'delete' },
  STRUCTURE_APPROVE: { resource: 'struktur', action: 'approve' },
  
  // Jamaah Management
  JAMAAH_KK_CREATE: { resource: 'jamaah_kepala_keluarga', action: 'create' },
  JAMAAH_KK_READ: { resource: 'jamaah_kepala_keluarga', action: 'read' },
  JAMAAH_KK_UPDATE: { resource: 'jamaah_kepala_keluarga', action: 'update' },
  JAMAAH_KK_DELETE: { resource: 'jamaah_kepala_keluarga', action: 'delete' },
  
  JAMAAH_REMAJA_CREATE: { resource: 'jamaah_remaja', action: 'create' },
  JAMAAH_REMAJA_READ: { resource: 'jamaah_remaja', action: 'read' },
  JAMAAH_REMAJA_UPDATE: { resource: 'jamaah_remaja', action: 'update' },
  JAMAAH_REMAJA_DELETE: { resource: 'jamaah_remaja', action: 'delete' },
  
  // Dhuafa Management
  DHUAFA_CREATE: { resource: 'dhuafa', action: 'create' },
  DHUAFA_READ: { resource: 'dhuafa', action: 'read' },
  DHUAFA_UPDATE: { resource: 'dhuafa', action: 'update' },
  DHUAFA_DELETE: { resource: 'dhuafa', action: 'delete' },
  
  // Activity Management
  ACTIVITY_CREATE: { resource: 'kegiatan', action: 'create' },
  ACTIVITY_READ: { resource: 'kegiatan', action: 'read' },
  ACTIVITY_UPDATE: { resource: 'kegiatan', action: 'update' },
  ACTIVITY_DELETE: { resource: 'kegiatan', action: 'delete' },
  ACTIVITY_APPROVE: { resource: 'kegiatan', action: 'approve' },
  
  // Financial Management
  FINANCE_INCOME_CREATE: { resource: 'keuangan_pemasukan', action: 'create' },
  FINANCE_INCOME_READ: { resource: 'keuangan_pemasukan', action: 'read' },
  FINANCE_INCOME_UPDATE: { resource: 'keuangan_pemasukan', action: 'update' },
  FINANCE_INCOME_DELETE: { resource: 'keuangan_pemasukan', action: 'delete' },
  
  FINANCE_EXPENSE_CREATE: { resource: 'keuangan_pengeluaran', action: 'create' },
  FINANCE_EXPENSE_READ: { resource: 'keuangan_pengeluaran', action: 'read' },
  FINANCE_EXPENSE_UPDATE: { resource: 'keuangan_pengeluaran', action: 'update' },
  FINANCE_EXPENSE_DELETE: { resource: 'keuangan_pengeluaran', action: 'delete' },
  
  FINANCE_REPORT_CREATE: { resource: 'laporan_keuangan', action: 'create' },
  FINANCE_REPORT_READ: { resource: 'laporan_keuangan', action: 'read' },
  FINANCE_REPORT_UPDATE: { resource: 'laporan_keuangan', action: 'update' },
  FINANCE_REPORT_DELETE: { resource: 'laporan_keuangan', action: 'delete' },
  FINANCE_REPORT_APPROVE: { resource: 'laporan_keuangan', action: 'approve' },
  
  // News Management
  NEWS_CREATE: { resource: 'berita', action: 'create' },
  NEWS_READ: { resource: 'berita', action: 'read' },
  NEWS_UPDATE: { resource: 'berita', action: 'update' },
  NEWS_DELETE: { resource: 'berita', action: 'delete' },
  NEWS_APPROVE: { resource: 'berita', action: 'approve' },
  
  // Gallery Management
  GALLERY_CREATE: { resource: 'galeri', action: 'create' },
  GALLERY_READ: { resource: 'galeri', action: 'read' },
  GALLERY_UPDATE: { resource: 'galeri', action: 'update' },
  GALLERY_DELETE: { resource: 'galeri', action: 'delete' },
  
  // Contact Management
  CONTACT_READ: { resource: 'kontak', action: 'read' },
  CONTACT_DELETE: { resource: 'kontak', action: 'delete' },
  
  // Audit Logs
  AUDIT_READ: { resource: 'audit', action: 'read' },
} as const

// Define role configurations
export const ROLE_CONFIGS = {
  MASTER_ADMIN: {
    name: 'Master Admin',
    description: 'Akses penuh ke seluruh sistem',
    permissions: Object.values(PERMISSIONS)
  },
  
  TOKOH_MASYARAKAT: {
    name: 'Tokoh Masyarakat',
    description: 'Akses penuh untuk peninjauan dan pengelolaan sistem',
    permissions: Object.values(PERMISSIONS)
  },
  
  KETUA_DKM: {
    name: 'Ketua DKM',
    description: 'Akses penuh untuk pengelolaan dan persetujuan',
    permissions: Object.values(PERMISSIONS)
  },
  
  SEKRETARIS_DKM: {
    name: 'Sekretaris DKM',
    description: 'Akses penuh untuk administrasi dan konten',
    permissions: Object.values(PERMISSIONS)
  },
  
  BENDAHARA_DKM: {
    name: 'Bendahara DKM',
    description: 'Akses penuh untuk keuangan dan laporan',
    permissions: Object.values(PERMISSIONS)
  },
  
  RISMA: {
    name: 'RISMA (Remaja Islam)',
    description: 'Akses penuh untuk kegiatan dan konten remaja',
    permissions: Object.values(PERMISSIONS)
  }
} as const

export type RoleName = keyof typeof ROLE_CONFIGS

// Map display names or strings to config keys for flexibility
const ROLE_NAME_MAP: Record<string, RoleName> = {
  'Master Admin': 'MASTER_ADMIN',
  'Tokoh Masyarakat': 'TOKOH_MASYARAKAT',
  'Ketua DKM': 'KETUA_DKM',
  'Sekretaris DKM': 'SEKRETARIS_DKM',
  'Bendahara DKM': 'BENDAHARA_DKM',
  'RISMA (Remaja Islam)': 'RISMA'
}

// Permission checking utilities
export function hasPermission(
  userPermissions: Permission[], 
  requiredPermission: Permission
): boolean {
  return userPermissions.some(
    permission => 
      permission.resource === requiredPermission.resource && 
      permission.action === requiredPermission.action
  )
}

export function hasAnyPermission(
  userPermissions: Permission[], 
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission))
}

export function hasAllPermissions(
  userPermissions: Permission[], 
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission))
}

export function canAccessResource(
  roleName: string,
  resource: string,
  action: string
): boolean {
  // Normalize role name to config key
  const normalizedRole = ROLE_NAME_MAP[roleName] || (roleName as RoleName)
  const roleConfig = ROLE_CONFIGS[normalizedRole as RoleName]
  
  if (!roleConfig) {
    if (roleName === 'any') return true
    return false
  }
  
  return roleConfig.permissions.some(
    permission => permission.resource === resource && permission.action === action
  )
}

// Get role permissions by role name
export function getRolePermissions(roleName: string): any[] {
  const normalizedRole = ROLE_NAME_MAP[roleName] || (roleName as RoleName)
  return (ROLE_CONFIGS[normalizedRole as RoleName]?.permissions as any) || []
}

// Check if user can perform action on specific resource
export function checkPermission(
  user: { role: { name: string } },
  resource: string,
  action: string
): boolean {
  return canAccessResource(user.role.name, resource, action)
}