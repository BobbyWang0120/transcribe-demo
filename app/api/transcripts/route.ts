import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const transcripts = await prisma.transcript.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ transcripts })
  } catch (error) {
    console.error('获取转录记录失败:', error)
    return NextResponse.json(
      { error: '获取转录记录失败' },
      { status: 500 }
    )
  }
} 