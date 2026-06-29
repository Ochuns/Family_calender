'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (password.length < 6) {
          setError('パスワードは6文字以上で入力してください')
          return
        }
        await register(email, password)
      }
      router.push('/')
    } catch (err: unknown) {
      if (mode === 'login') {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        const code = (err as { code?: string }).code
        if (code === 'auth/email-already-in-use') {
          setError('このメールアドレスはすでに登録されています')
        } else {
          setError('登録に失敗しました。もう一度お試しください')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          家族カレンダー
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {mode === 'login' ? 'ログインして予定を確認しましょう' : 'アカウントを作成してください'}
        </p>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'login' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'register' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
            }`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              パスワード{mode === 'register' && <span className="text-xs text-gray-400 ml-1">（6文字以上）</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 py-3 text-base font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録して始める'}
          </button>
        </form>
      </div>
    </main>
  )
}
