'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventContentArg } from '@fullcalendar/core'
import { MEMBER_COLORS } from '@/types/event'
import type { CalendarEvent } from '@/types/event'

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

  return (
    <div className="fc-family">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
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
