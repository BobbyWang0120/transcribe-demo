import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getRemainingMinutes } from '@/lib/usage'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权', remainingMinutes: 0 },
        { status: 401 }
      )
    }

    const remainingMinutes = await getRemainingMinutes(session.user.id)

    return NextResponse.json({
      remainingMinutes,
      success: true
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取使用量失败'
    console.error('获取使用量失败:', errorMessage)
    
    return NextResponse.json(
      {
        error: errorMessage,
        remainingMinutes: 0,
        success: false
      },
      { status: 500 }
    )
  }
} 