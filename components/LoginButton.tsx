'use client'

import { signIn } from 'next-auth/react'

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      使用 Google 账号登录
    </button>
  )
} 