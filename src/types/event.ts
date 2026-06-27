export type FamilyMember = 'mama' | 'papa' | 'family'

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
  family: '#4ade80',
}

export const MEMBER_LABELS: Record<FamilyMember, string> = {
  mama: 'ママ',
  papa: 'パパ',
  family: '家族全員',
}
