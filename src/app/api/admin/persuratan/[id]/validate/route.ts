import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { checkPermission } from '@/lib/auth/rbac'
import { createAuditLog } from '@/lib/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const user = session?.user

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Master Admin, Ketua DKM, and Tokoh Masyarakat can validate
    const canValidate = ['Master Admin', 'Ketua DKM', 'Tokoh Masyarakat'].includes(user.role)
    
    if (!canValidate) {
      return NextResponse.json({ error: 'Forbidden: Only Master Admin, Ketua DKM, or Tokoh Masyarakat can validate documents' }, { status: 403 })
    }

    const body = await request.json()
    const { action, rejectionNote } = body // action: 'validate' or 'reject'

    const document = await db.dokumenResmi.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updatedDocument = await db.dokumenResmi.update({
      where: { id },
      data: {
        status: action === 'validate' ? 'validated' : 'rejected',
        validatedBy: user.id,
        validatedAt: new Date(),
        rejectionNote: action === 'reject' ? rejectionNote : null
      }
    })

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: action === 'validate' ? 'VALIDATE_DOCUMENT' : 'REJECT_DOCUMENT',
      table: 'dokumen_resmi',
      recordId: id
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error validating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
