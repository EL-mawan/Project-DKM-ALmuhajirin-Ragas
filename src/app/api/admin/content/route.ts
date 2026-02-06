import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { db as prisma } from '@/lib/db'
import { checkPermission } from '@/lib/auth/rbac'

// GET - Fetch all homepage content
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasPermission = checkPermission(user, 'content', 'read')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const content = await prisma.homepageContent.findMany({
      orderBy: { order: 'asc' }
    })

    // If no content exists, create default sections
    if (content.length === 0) {
      const defaultSections = [
        {
          section: 'hero',
          title: 'Memakmurkan Masjid, Mendekatkan Diri Kepada Allah',
          subtitle: 'DKM Al-Muhajirin',
          description: 'Pusat kegiatan spiritual, pendidikan, dan sosial untuk masyarakat Ragas Grenyang. Mari bersama menebar kebaikan dan mempererat ukhuwah islamiyah.',
          imageUrl: '/WhatsApp Image 2026-02-06 at 20.29.40.jpeg',
          isActive: true,
          order: 1
        },
        {
          section: 'stats',
          content: JSON.stringify({
            jamaahKK: 150,
            jamaahRemaja: 80,
            kaumDhuafa: 25
          }),
          isActive: true,
          order: 2
        },
        {
          section: 'about',
          title: 'Membangun Peradaban dari Masjid',
          subtitle: 'Visi & Misi',
          description: 'Kami percaya bahwa masjid bukan sekadar tempat ibadah, melainkan pusat pembinaan karakter dan pemberdayaan sosial bagi seluruh lapisan masyarakat.',
          content: 'Program pendidikan Islam, pemberdayaan sosial, dan fasilitas modern untuk umat.',
          isActive: true,
          order: 3
        },
        {
          section: 'contact',
          title: 'Mari Berdiskusi & Berkolaborasi',
          subtitle: 'Hubungi Kami',
          description: 'Pintu kami selalu terbuka untuk aspirasi, saran, dan pertanyaan Anda. Hubungi kami kapan saja untuk layanan jamaah yang lebih baik.',
          content: JSON.stringify({
            phone: '0812-3456-7890',
            email: 'dkm.almuhajirin@example.com',
            address: 'Ragas Grenyang, Lampung Selatan'
          }),
          isActive: true,
          order: 4
        }
      ]

      await prisma.homepageContent.createMany({
        data: defaultSections
      })

      const newContent = await prisma.homepageContent.findMany({
        orderBy: { order: 'asc' }
      })

      return NextResponse.json(newContent)
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update homepage content
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasPermission = checkPermission(user, 'content', 'update')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { section, title, subtitle, description, content, imageUrl, isActive, order } = body

    // Upsert (create or update)
    const updatedContent = await prisma.homepageContent.upsert({
      where: { section },
      update: {
        title,
        subtitle,
        description,
        content,
        imageUrl,
        isActive,
        order
      },
      create: {
        section,
        title,
        subtitle,
        description,
        content,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
