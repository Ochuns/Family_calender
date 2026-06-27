export type FamilyMember = 'mama' | 'papa' | 'jibun' | 'otouto1' | 'otouto2' | 'sofu' | 'family'

export interface MemberInfo {
  id: FamilyMember
  label: string
  color: string
  order: number
}

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

export const DEFAULT_MEMBERS: MemberInfo[] = [
  { id: 'mama',    label: '母',      color: '#f87171', order: 0 },
  { id: 'papa',    label: '父',      color: '#60a5fa', order: 1 },
  { id: 'jibun',   label: '自分',    color: '#a78bfa', order: 2 },
  { id: 'otouto1', label: '弟１',    color: '#fb923c', order: 3 },
  { id: 'otouto2', label: '弟２',    color: '#fbbf24', order: 4 },
  { id: 'sofu',    label: '祖父',    color: '#34d399', order: 5 },
  { id: 'family',  label: '家族全員', color: '#94a3b8', order: 6 },
]

export const MEMBER_COLORS: Record<FamilyMember, string> = Object.fromEntries(
  DEFAULT_MEMBERS.map((m) => [m.id, m.color])
) as Record<FamilyMember, string>

export const MEMBER_LABELS: Record<FamilyMember, string> = Object.fromEntries(
  DEFAULT_MEMBERS.map((m) => [m.id, m.label])
) as Record<FamilyMember, string>
