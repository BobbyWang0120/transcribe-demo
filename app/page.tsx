import { Metadata } from 'next'
import TranscriptionTool from '@/components/TranscriptionTool'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import UserNav from '@/components/UserNav'
import Link from 'next/link'
import { Mic, FileAudio, Clock, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: '音频转录工具',
  description: '使用 AI 将音频转录为文本',
}

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold md:hidden">BoBo音频</h1>
            <h1 className="text-2xl font-bold hidden md:block">BoBo音频转录工具</h1>
            <UserNav session={session} />
          </div>
          <TranscriptionTool />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium md:hidden">BoBo音频</h1>
          <h1 className="text-2xl font-medium hidden md:block">BoBo音频转录工具</h1>
          <div className="space-x-2 md:space-x-4">
            <Link
              href="/login"
              className="inline-block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="inline-block px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800"
            >
              注册
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-full px-4 md:px-8 py-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-gray-50">
              <Mic className="w-10 h-10 md:w-16 md:h-16 text-gray-900 mb-4 md:mb-6" />
              <h2 className="text-lg md:text-xl font-medium mb-2">支持多种音频格式</h2>
              <p className="text-sm md:text-base text-gray-600">轻松处理 MP3、WAV、M4A 等格式</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-gray-50">
              <FileAudio className="w-10 h-10 md:w-16 md:h-16 text-gray-900 mb-4 md:mb-6" />
              <h2 className="text-lg md:text-xl font-medium mb-2">智能识别语言</h2>
              <p className="text-sm md:text-base text-gray-600">自动检测并处理多种语言</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-gray-50">
              <Clock className="w-10 h-10 md:w-16 md:h-16 text-gray-900 mb-4 md:mb-6" />
              <h2 className="text-lg md:text-xl font-medium mb-2">高精度转录</h2>
              <p className="text-sm md:text-base text-gray-600">AI 驱动的精准音频识别</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-gray-50">
              <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-gray-900 mb-4 md:mb-6" />
              <h2 className="text-lg md:text-xl font-medium mb-2">免费使用</h2>
              <p className="text-sm md:text-base text-gray-600">每月 120 分钟免费额度</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 