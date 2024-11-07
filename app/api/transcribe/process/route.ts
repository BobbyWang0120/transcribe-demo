import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import prisma from '@/lib/prisma'
import { canTranscribe } from '@/lib/usage'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface WhisperResponse {
  task: string
  language: string
  duration: number
  text: string
  segments: Array<{
    id: number
    seek: number
    start: number
    end: number
    text: string
    tokens: number[]
    temperature: number
    avg_logprob: number
    compression_ratio: number
    no_speech_prob: number
  }>
}

export async function POST(request: Request) {
  // 验证内部请求
  const token = request.headers.get('x-internal-token')
  if (token !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  let taskId: string | undefined
  try {
    const body = await request.json()
    taskId = body.taskId

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID' }, { status: 400 })
    }

    const task = await prisma.transcriptionTask.findUnique({
      where: { id: taskId },
      include: { user: true }
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    // 获取文件并转录
    const response = await fetch(task.blobUrl)
    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], task.fileName, { type: blob.type }),
      model: 'whisper-1',
      response_format: 'verbose_json'
    }) as unknown as WhisperResponse

    const durationInMinutes = transcription.duration / 60

    // 检查使用量
    if (!(await canTranscribe(task.userId, durationInMinutes))) {
      await prisma.transcriptionTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          error: '使用量不足'
        }
      })
      return NextResponse.json({ error: '使用量不足' }, { status: 403 })
    }

    // 更新任务状态和保存转录记录
    await prisma.$transaction([
      prisma.transcriptionTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          text: transcription.text,
          duration: durationInMinutes
        }
      }),
      prisma.transcript.create({
        data: {
          userId: task.userId,
          audioUrl: task.fileName,
          audioBlobUrl: task.blobUrl,
          text: transcription.text,
          audioDuration: durationInMinutes,
        }
      }),
      prisma.usageRecord.create({
        data: {
          userId: task.userId,
          minutes: durationInMinutes,
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('处理转录任务失败:', error)
    // 只有在 taskId 存在且有效时才尝试更新任务状态
    if (typeof taskId === 'string') {
      try {
        await prisma.transcriptionTask.update({
          where: { id: taskId },
          data: {
            status: 'failed',
            error: '转录处理失败'
          }
        })
      } catch (updateError) {
        console.error('更新任务状态失败:', updateError)
      }
    }
    return NextResponse.json(
      { error: '处理转录任务失败' },
      { status: 500 }
    )
  }
} 