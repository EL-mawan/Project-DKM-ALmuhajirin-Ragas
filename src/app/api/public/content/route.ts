import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const content = await prisma.homepageContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Transform to key-value format for easier access
    const contentMap = content.reduce((acc, item) => {
      acc[item.section] = {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        content: item.content,
        imageUrl: item.imageUrl
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(contentMap)
  } catch (error) {
    console.error('Error fetching public content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
