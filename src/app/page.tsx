'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, role, logout } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">家族カレンダー</h1>
      <p className="text-gray-600">{user?.email}</p>
      <p className="text-sm text-gray-400">
        {role === 'admin' ? '管理者' : '閲覧者'}
      </p>
      <button
        onClick={logout}
        className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
      >
        ログアウト
      </button>
    </main>
  )
}
