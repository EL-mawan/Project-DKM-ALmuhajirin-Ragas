import { db } from './db'

export async function createAuditLog({
  userId,
  action,
  table,
  recordId,
  oldValues,
  newValues,
  ipAddress,
  userAgent
}: {
  userId: string
  action: string
  table?: string
  recordId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}) {
  try {
    return await db.auditLog.create({
      data: {
        userId,
        action,
        table,
        recordId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
