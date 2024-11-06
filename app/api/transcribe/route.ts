import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { blobUrl, fileName } = await request.json()
    
    if (!blobUrl) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    // 从 Blob URL 获取文件
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    // 调用 OpenAI API 获取详细的转录结果
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], fileName, { type: blob.type }),
      model: 'whisper-1',
      response_format: 'verbose_json'
    }) as unknown as WhisperResponse

    // 将秒转换为分钟
    const durationInMinutes = transcription.duration / 60

    // 检查用户是否有足够的使用量
    if (!(await canTranscribe(session.user.id, durationInMinutes))) {
      return NextResponse.json({ error: '使用量不足' }, { status: 403 })
    }

    // 保存转录记录
    await prisma.transcript.create({
      data: {
        userId: session.user.id,
        audioUrl: fileName,
        audioBlobUrl: blobUrl,
        text: transcription.text,
        audioDuration: durationInMinutes,
      },
    })

    // 记录使用量
    await prisma.usageRecord.create({
      data: {
        userId: session.user.id,
        minutes: durationInMinutes,
      },
    })

    return NextResponse.json({
      text: transcription.text,
      duration: durationInMinutes,
      language: transcription.language
    })
  } catch (error) {
    console.error('转录错误:', error)
    return NextResponse.json(
      { error: '转录过程中发生错误' },
      { status: 500 }
    )
  }
} 