'use client'

import { useState, useCallback } from 'react'
import type { NewEventInput } from '@/hooks/useEvents'
import type { CalendarEvent, FamilyMember } from '@/types/event'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { useMembers } from '@/contexts/MembersContext'

interface Props {
  initialDate?: string
  initialValues?: CalendarEvent
  onSave: (event: NewEventInput, notify: boolean) => Promise<void>
  onUpdate?: (id: string, input: NewEventInput) => Promise<void>
  onClose: () => void
}

function MicButton({
  onResult,
  disabled,
}: {
  onResult: (text: string) => void
  disabled?: boolean
}) {
  const { state, isSupported, start, stop } = useVoiceInput({ onResult })

  if (!isSupported) return null

  const isListening = state === 'listening'

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={isListening ? stop : start}
      disabled={disabled}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        isListening
          ? 'animate-pulse bg-red-500 text-white'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
      aria-label={isListening ? '音声入力を停止' : '音声入力を開始'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
      </svg>
    </button>
  )
}

export default function EventModal({ initialDate, initialValues, onSave, onUpdate, onClose }: Props) {
  const isEditMode = !!initialValues
  const { members, memberColors, memberLabels } = useMembers()

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [start, setStart] = useState(initialValues?.start ?? initialDate ?? '')
  const [end, setEnd] = useState(initialValues?.end ?? '')
  const [allDay, setAllDay] = useState(initialValues?.allDay ?? true)
  const [member, setMember] = useState<FamilyMember>(initialValues?.member ?? 'family')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [saving, setSaving] = useState(false)

  const handleTitleVoice = useCallback((text: string) => {
    setTitle((prev) => (prev ? prev + text : text))
  }, [])

  const handleDescriptionVoice = useCallback((text: string) => {
    setDescription((prev) => (prev ? prev + text : text))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !start) return
    setSaving(true)
    try {
      const input: NewEventInput = {
        title: title.trim(),
        start,
        end: end || undefined,
        allDay,
        member,
        description: description.trim() || undefined,
      }
      if (isEditMode && onUpdate) {
        await onUpdate(initialValues.id, input)
      } else {
        await onSave(input, false)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-4 sm:p-6 sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        <h2 className="mb-3 text-base font-bold text-gray-800">
          {isEditMode ? '予定を編集' : '予定を追加'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">タイトル</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="例: 学校の運動会"
              />
              <MicButton onResult={handleTitleVoice} disabled={saving} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">終日</label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">開始</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">終了</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">誰の予定？</label>
            <div className="grid grid-cols-3 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMember(m.id)}
                  style={member === m.id ? { backgroundColor: memberColors[m.id], color: '#fff' } : {}}
                  className={`rounded-lg py-1.5 text-sm font-medium transition ${
                    member === m.id ? '' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {memberLabels[m.id]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">メモ（任意）</label>
            <div className="flex gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={1}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="詳細メモ..."
              />
              <div className="flex flex-col justify-start pt-0.5">
                <MicButton onResult={handleDescriptionVoice} disabled={saving} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : isEditMode ? '更新' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
