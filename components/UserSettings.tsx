'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UserData {
  email: string
  name: string | null
  isPremium: boolean
  remainingMinutes: number
}

export default function UserSettings() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user')
        if (!response.ok) throw new Error('获取用户信息失败')
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        console.error('获取用户信息失败:', err)
        toast.error('获取用户信息失败')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('新密码两次输入不一致')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      toast.success('密码修改成功')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : '密码修改失败'
      toast.error(message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('确定要删除账号吗？此操作不可撤销。')) {
      return
    }

    setIsDeletingAccount(true)
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除账号失败')
      
      toast.success('账号已删除')
      router.push('/')
    } catch (err) {
      console.error('删除账号失败:', err)
      toast.error('删除账号失败')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return <div className="text-center">加载中...</div>
  }

  if (!userData) {
    return <div className="text-center text-red-500">加载用户信息失败</div>
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">基本信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <p className="mt-1">{userData.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">账户类型</label>
            <p className="mt-1">{userData.isPremium ? '付费用户' : '免费用户'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">剩余可用时长</label>
            <p className="mt-1">{userData.remainingMinutes} 分钟</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">修改密码</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">当前密码</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isChangingPassword ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-red-600 mb-4">危险操作</h2>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeletingAccount}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
        >
          {isDeletingAccount ? '删除中...' : '删除账号'}
        </button>
        <p className="mt-2 text-sm text-gray-500">
          删除账号后，所有相关数据将被永久删除且无法恢复。
        </p>
      </div>
    </div>
  )
} 