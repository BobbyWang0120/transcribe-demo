import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { canTranscribe } from '@/lib/usage'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { blobUrl, fileName } = await request.json()
    
    if (!blobUrl) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    // 创建转录任务记录
    const task = await prisma.transcriptionTask.create({
      data: {
        userId: session.user.id,
        status: 'pending',
        blobUrl,
        fileName,
      }
    })

    // 触发后台转录任务
    fetch(`${process.env.VERCEL_URL}/api/transcribe/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 添加一个密钥来验证内部请求
        'x-internal-token': process.env.INTERNAL_API_TOKEN as string,
      },
      body: JSON.stringify({ taskId: task.id }),
    }).catch(console.error) // 不等待响应

    return NextResponse.json({ taskId: task.id })
  } catch (error) {
    console.error('创建转录任务失败:', error)
    return NextResponse.json(
      { error: '创建转录任务失败' },
      { status: 500 }
    )
  }
} 