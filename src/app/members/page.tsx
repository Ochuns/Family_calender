'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useMembers } from '@/contexts/MembersContext'
import type { FamilyMember } from '@/types/event'

export default function MembersPage() {
  const { role, loading: authLoading } = useAuth()
  const { members, loading, updateMember, initializeMembers } = useMembers()
  const router = useRouter()

  const [edits, setEdits] = useState<Record<string, { label: string; color: string }>>({})
  const [saving, setSaving] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && role !== 'admin') {
      router.replace('/')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    const initial: Record<string, { label: string; color: string }> = {}
    members.forEach((m) => {
      initial[m.id] = { label: m.label, color: m.color }
    })
    setEdits(initial)
  }, [members])

  const hasChanges = members.some((m) => {
    const edit = edits[m.id]
    return edit && (edit.label !== m.label || edit.color !== m.color)
  })

  const handleSave = async () => {
    const changedMembers = members.filter((m) => {
      const edit = edits[m.id]
      return edit && (edit.label !== m.label || edit.color !== m.color)
    })
    if (changedMembers.length === 0) return

    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await Promise.all(
        changedMembers.map((m) => updateMember(m.id as FamilyMember, edits[m.id]))
      )
      console.log('✓ メンバーを保存しました', changedMembers.map((m) => edits[m.id]))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('メンバー保存エラー:', error)
      setSaveError('保存に失敗しました。Firestoreのセキュリティルールを確認してください。')
    } finally {
      setSaving(false)
    }
  }

  const handleInitialize = async () => {
    setInitializing(true)
    setSaveError(null)
    try {
      await initializeMembers()
      console.log('✓ メンバーを初期化しました')
    } catch (error) {
      console.error('初期化エラー:', error)
      setSaveError('初期化に失敗しました。Firestoreのセキュリティルールを確認してください。')
    } finally {
      setInitializing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link href="/" className="text-sm text-blue-500 hover:text-blue-600">
            ← 戻る
          </Link>
          <h1 className="text-lg font-bold text-gray-800">メンバー管理</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-3">
          <p className="text-sm text-gray-500">
            メンバーの表示名とカラーを変更できます。色の丸をタップするとカラーピッカーが開きます。
          </p>

          {members.map((m) => {
            const edit = edits[m.id] ?? { label: m.label, color: m.color }
            const changed = edit.label !== m.label || edit.color !== m.color
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition ${
                  changed ? 'ring-2 ring-blue-300' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="h-10 w-10 rounded-full border-2 border-gray-200"
                    style={{ backgroundColor: edit.color }}
                  />
                  <input
                    type="color"
                    value={edit.color}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [m.id]: { ...edit, color: e.target.value },
                      }))
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    title="色を変更"
                  />
                </div>
                <input
                  type="text"
                  value={edit.label}
                  onChange={(e) =>
                    setEdits((prev) => ({
                      ...prev,
                      [m.id]: { ...edit, label: e.target.value },
                    }))
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
                />
              </div>
            )
          })}

          {saveError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {saveError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`w-full rounded-xl py-3.5 text-sm font-semibold transition ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40'
              }`}
            >
              {saving ? '保存中...' : saved ? '保存しました ✓' : '変更を保存'}
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2 text-xs text-gray-400">
              Firestoreにメンバーデータを初期化します（変更した内容はリセットされます）
            </p>
            <button
              onClick={handleInitialize}
              disabled={initializing}
              className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              {initializing ? '初期化中...' : 'デフォルトに戻す'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
