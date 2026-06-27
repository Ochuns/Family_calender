'use client'

import { useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventContentArg } from '@fullcalendar/core'
import { MEMBER_COLORS } from '@/types/event'
import type { CalendarEvent } from '@/types/event'

type ViewType = 'dayGridMonth' | 'dayGridWeek' | 'dayGridDay'

const VIEW_LABELS: { key: ViewType; label: string }[] = [
  { key: 'dayGridMonth', label: '月' },
  { key: 'dayGridWeek', label: '週' },
  { key: 'dayGridDay', label: '日' },
]

interface Props {
  events: CalendarEvent[]
  isAdmin: boolean
  onDateSelect: (date: string) => void
  onEventClick: (event: CalendarEvent) => void
}

function renderEventContent(info: EventContentArg) {
  return (
    <div className="flex items-center gap-1 overflow-hidden px-1">
      <span className="truncate text-xs font-medium leading-tight">{info.event.title}</span>
    </div>
  )
}

export default function CalendarView({ events, isAdmin, onDateSelect, onEventClick }: Props) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState<ViewType>('dayGridMonth')

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    backgroundColor: MEMBER_COLORS[e.member],
    borderColor: MEMBER_COLORS[e.member],
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
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next today',
        }}
        height="auto"
        events={fcEvents}
        selectable={isAdmin}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        buttonText={{ today: '今日' }}
        dayCellClassNames="cursor-pointer"
      />
    </div>
  )
}
