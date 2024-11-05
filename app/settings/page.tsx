import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { UserSettings } from '@/components'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">用户设置</h1>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <Home className="h-4 w-4 mr-2" />
            返回主页
          </Link>
        </div>
        <UserSettings userId={session.user.id} />
      </div>
    </main>
  )
} 