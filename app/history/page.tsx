import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TranscriptList } from '@/components'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">转录历史</h1>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <Home className="h-4 w-4 mr-2" />
            返回主页
          </Link>
        </div>
        <TranscriptList />
      </div>
    </main>
  )
} 