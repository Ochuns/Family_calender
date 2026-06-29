'use client'

import { useRef, useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventContentArg } from '@fullcalendar/core'
import { useMembers } from '@/contexts/MembersContext'
import type { CalendarEvent } from '@/types/event'

type ViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

const VIEW_LABELS: { key: ViewType; label: string }[] = [
  { key: 'dayGridMonth', label: '月' },
  { key: 'timeGridWeek', label: '週' },
  { key: 'timeGridDay', label: '日' },
]

interface Props {
  events: CalendarEvent[]
  isAdmin: boolean
  onDateSelect: (date: string) => void
  onEventClick: (event: CalendarEvent) => void
}

function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTimeRange(e: CalendarEvent) {
  if (e.allDay) return '終日'
  const startTime = e.start.length >= 16 ? e.start.slice(11, 16) : ''
  const endTime = e.end && e.end.length >= 16 ? e.end.slice(11, 16) : ''
  return endTime ? `${startTime}〜${endTime}` : startTime
}

export default function CalendarView({ events, isAdmin, onDateSelect, onEventClick }: Props) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState<ViewType>('dayGridMonth')
  const { memberColors, memberLabels } = useMembers()

  // memberColorsが更新されたとき（Firestoreロード後など）にFullCalendarの色を強制更新
  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api) return
    api.getEvents().forEach((event) => {
      const original = event.extendedProps.original as CalendarEvent
      const color = memberColors[original.member] ?? '#94a3b8'
      event.setProp('backgroundColor', color)
      event.setProp('borderColor', color)
    })
  }, [memberColors])

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    backgroundColor: memberColors[e.member] ?? '#94a3b8',
    borderColor: memberColors[e.member] ?? '#94a3b8',
    textColor: '#fff',
    extendedProps: { original: e },
  }))

  const handleDateSelect = (info: DateSelectArg) => {
    if (!isAdmin) return
    onDateSelect(info.startStr)
  }

  const handleEventClick = (info: EventClickArg) => {
    const original = info.event.extendedProps.original as CalendarEvent
    onEventClick(original)
  }

  const changeView = (view: ViewType) => {
    calendarRef.current?.getApi().changeView(view)
    setCurrentView(view)
  }

  const renderEventContent = (info: EventContentArg) => {
    const original = info.event.extendedProps.original as CalendarEvent
    const label = memberLabels[original.member] ?? ''
    const initial = label.charAt(0)
    return (
      <div className="flex items-center gap-0.5 overflow-hidden px-1">
        <span
          className="flex-shrink-0 inline-flex items-center justify-center rounded-full text-[9px] font-bold leading-none"
          style={{
            width: '15px',
            height: '15px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          {initial}
        </span>
        <span className="truncate text-xs font-medium leading-tight ml-0.5">{info.event.title}</span>
      </div>
    )
  }

  const todayStr = getTodayStr()
  const todayEvents = events
    .filter((e) => e.start.slice(0, 10) === todayStr)
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return a.start.localeCompare(b.start)
    })

  return (
    <div className="fc-family">
      {/* View switcher */}
      <div className="mb-3 flex justify-end gap-1">
        {VIEW_LABELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeView(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              currentView === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next today',
        }}
        height={currentView === 'dayGridMonth' ? 'auto' : 'calc(100vh - 220px)'}
        events={fcEvents}
        selectable={isAdmin}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        buttonText={{ today: '今日' }}
        dayCellClassNames="cursor-pointer"
        nowIndicator={true}
        scrollTime="08:00:00"
      />

      {/* 本日の予定サマリー（月表示のみ） */}
      {currentView === 'dayGridMonth' && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {new Date().getDate()}
            </span>
            本日の予定
          </h2>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-gray-400">今日の予定はありません</p>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((e) => {
                const label = memberLabels[e.member] ?? ''
                const color = memberColors[e.member] ?? '#94a3b8'
                const initial = label.charAt(0)
                return (
                  <li key={e.id} className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0 text-xs text-gray-400">
                      {formatTimeRange(e)}
                    </span>
                    <span
                      className="flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {initial}
                    </span>
                    <span className="truncate text-sm text-gray-700">{e.title}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
