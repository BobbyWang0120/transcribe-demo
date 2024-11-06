'use client'

import { useEffect, useState } from 'react'
import { Session } from 'next-auth'
import toast from 'react-hot-toast'
import UserDropdown from './UserDropdown'
import { Clock } from 'lucide-react'

export default function UserNav({ session }: { session: Session | null }) {
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      if (!session?.user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const res = await fetch('/api/usage')
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || '获取使用量失败')
        }

        const data = await res.json()
        
        if (typeof data.remainingMinutes !== 'number') {
          throw new Error('无效的使用量数据')
        }

        setRemainingMinutes(Math.floor(data.remainingMinutes))
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取使用量失败'
        console.error('获取使用量失败:', message)
        toast.error('获取使用量失败，请刷新页面重试')
        setRemainingMinutes(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [session])

  if (!session) return null

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center text-sm">
        <Clock className="h-4 w-4 text-gray-500 mr-1" />
        <span className="font-medium">
          {isLoading ? (
            <span className="text-gray-400">...</span>
          ) : (
            `${remainingMinutes ?? 0}分钟`
          )}
        </span>
      </div>
      <UserDropdown session={session} />
    </div>
  )
} 