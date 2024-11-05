import { Metadata } from 'next'
import TranscriptionTool from '@/components/TranscriptionTool'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import UserNav from '@/components/UserNav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '音频转录工具',
  description: '使用 AI 将音频转录为文本',
}

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI 音频转录工具</h1>
          <UserNav session={session} />
        </div>
        
        {session ? (
          <TranscriptionTool />
        ) : (
          <div className="text-center space-y-4">
            <p className="text-lg">请先登录以使用转录功能</p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 