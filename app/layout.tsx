import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="zh">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
