export type FamilyMember = 'mama' | 'papa' | 'jibun' | 'otouto1' | 'otouto2' | 'sofu' | 'family'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay: boolean
  member: FamilyMember
  description?: string
  createdAt: string
}

export const MEMBER_COLORS: Record<FamilyMember, string> = {
  mama: '#f87171',
  papa: '#60a5fa',
  jibun: '#a78bfa',
  otouto1: '#fb923c',
  otouto2: '#fbbf24',
  sofu: '#34d399',
  family: '#94a3b8',
}

export const MEMBER_LABELS: Record<FamilyMember, string> = {
  mama: '母',
  papa: '父',
  jibun: '自分',
  otouto1: '弟１',
  otouto2: '弟２',
  sofu: '祖父',
  family: '家族全員',
}
