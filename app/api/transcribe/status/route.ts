import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 })
    }

    const task = await prisma.transcriptionTask.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: '无权访问此任务' }, { status: 403 })
    }

    return NextResponse.json({
      status: task.status,
      text: task.text,
      duration: task.duration,
      error: task.error
    })
  } catch (error) {
    console.error('获取转录状态失败:', error)
    return NextResponse.json(
      { error: '获取转录状态失败' },
      { status: 500 }
    )
  }
} 