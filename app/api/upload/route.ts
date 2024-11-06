import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'audio/mpeg',      // .mp3
            'audio/wav',       // .wav
            'audio/x-m4a',     // .m4a
            'audio/mp4',       // .m4a (alternative MIME type)
            'audio/aac',       // .aac
            'audio/x-wav',     // .wav (alternative MIME type)
            'audio/vnd.wave'   // .wav (another alternative MIME type)
          ],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          if (tokenPayload) {
            const { userId } = JSON.parse(tokenPayload)
            console.log('音频文件上传完成:', {
              url: blob.url,
              userId,
              pathname: blob.pathname,
            })
          }
        } catch (err) {
          console.error('处理上传完成事件失败:', err)
          throw new Error('处理上传完成事件失败')
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error('上传失败:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '上传失败' },
      { status: 400 }
    )
  }
} 