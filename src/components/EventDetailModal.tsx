'use client'

import { MEMBER_COLORS, MEMBER_LABELS } from '@/types/event'
import type { CalendarEvent } from '@/types/event'

interface Props {
  event: CalendarEvent
  isAdmin: boolean
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export default function EventDetailModal({ event, isAdmin, onDelete, onClose }: Props) {
  const handleDelete = async () => {
    await onDelete(event.id)
    onClose()
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div
          className="mb-1 h-2 w-12 rounded-full"
          style={{ backgroundColor: MEMBER_COLORS[event.member] }}
        />
        <h2 className="mb-1 text-xl font-bold text-gray-800">{event.title}</h2>
        <p className="mb-4 text-sm text-gray-500">{MEMBER_LABELS[event.member]}</p>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex gap-2">
            <span className="font-medium text-gray-500">開始</span>
            <span>{formatDate(event.start)}</span>
          </div>
          {event.end && (
            <div className="flex gap-2">
              <span className="font-medium text-gray-500">終了</span>
              <span>{formatDate(event.end)}</span>
            </div>
          )}
          {event.description && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex-1 rounded-lg bg-red-50 py-3 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              削除
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
