import { getSupabase } from '@/lib/supabase'
import type {
  ModerationReport, ModerationReportInsert, ModerationStatus, ReportReason,
  ModerationAction, ModerationActionInsert,
  UserWarning, UserWarningInsert,
  UserBan, UserBanInsert,
  AiModerationLog,
  Profile,
} from '@/lib/database.types'
import {
  USE_MOCK, MOCK_REPORTS, MOCK_WARNINGS, MOCK_BANS,
  MOCK_AI_LOGS, MOCK_ACTIONS, MOCK_USERS, MOCK_STATS,
} from '@/lib/mock-moderation-data'

const supabase = getSupabase()

// ─── Report Filters ─────────────────────────────────

export interface ReportFilters {
  status?: ModerationStatus
  reason?: ReportReason
  priority?: number
  search?: string
  sortBy?: 'created_at' | 'priority' | 'ai_score'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// ─── Reports ────────────────────────────────────────

export async function getReports(filters: ReportFilters = {}) {
  if (USE_MOCK) {
    let filtered = [...MOCK_REPORTS]
    if (filters.status) filtered = filtered.filter(r => r.status === filters.status)
    if (filters.reason) filtered = filtered.filter(r => r.reason === filters.reason)
    if (filters.priority !== undefined) filtered = filtered.filter(r => r.priority === filters.priority)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(r =>
        r.product_title?.toLowerCase().includes(q) ||
        r.reported_user_name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    }
    // Sort
    const sortBy = filters.sortBy || 'created_at'
    const desc = (filters.sortOrder || 'desc') === 'desc'
    filtered.sort((a, b) => {
      const av = sortBy === 'priority' ? a.priority : sortBy === 'ai_score' ? (a.ai_score ?? 0) : new Date(a.created_at).getTime()
      const bv = sortBy === 'priority' ? b.priority : sortBy === 'ai_score' ? (b.ai_score ?? 0) : new Date(b.created_at).getTime()
      return desc ? bv - av : av - bv
    })
    const offset = filters.offset || 0
    const limit = filters.limit || 20
    return { data: filtered.slice(offset, offset + limit), count: filtered.length }
  }

  let query = supabase
    .from('moderation_reports')
    .select('*', { count: 'exact' })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.reason) query = query.eq('reason', filters.reason)
  if (filters.priority !== undefined) query = query.eq('priority', filters.priority)

  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as ModerationReport[], count: count ?? 0 }
}

export async function getReportById(id: string) {
  if (USE_MOCK) {
    return MOCK_REPORTS.find(r => r.id === id) || null
  }
  const { data, error } = await supabase
    .from('moderation_reports')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as ModerationReport
}

export async function createReport(report: ModerationReportInsert) {
  if (USE_MOCK) return { id: 'mock_new_report', ...report }
  const { data, error } = await supabase
    .from('moderation_reports')
    .insert(report)
    .select()
    .single()
  if (error) throw error
  return data as ModerationReport
}

export async function updateReportStatus(
  id: string,
  status: ModerationStatus,
  adminId: string,
  note?: string
) {
  if (USE_MOCK) {
    const report = MOCK_REPORTS.find(r => r.id === id)
    if (report) {
      report.status = status
      report.resolution_note = note || null
      report.assigned_admin_id = adminId
      if (status === 'approved' || status === 'rejected') {
        report.resolved_at = new Date().toISOString()
      }
    }
    return report
  }

  const updates: Record<string, unknown> = {
    status,
    assigned_admin_id: adminId,
    updated_at: new Date().toISOString(),
  }
  if (note) updates.resolution_note = note
  if (status === 'approved' || status === 'rejected') {
    updates.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('moderation_reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ModerationReport
}

// ─── Actions (Audit Log) ───────────────────────────

export async function logAction(action: ModerationActionInsert) {
  if (USE_MOCK) {
    MOCK_ACTIONS.unshift({ ...action, id: `action_mock_${Date.now()}`, created_at: new Date().toISOString() } as ModerationAction)
    return
  }
  const { error } = await supabase.from('moderation_actions').insert(action)
  if (error) throw error
}

export async function getActions(limit = 20) {
  if (USE_MOCK) {
    return MOCK_ACTIONS.slice(0, limit)
  }
  const { data, error } = await supabase
    .from('moderation_actions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as ModerationAction[]
}

// ─── User Management ────────────────────────────────

export interface UserFilters {
  search?: string
  bannedOnly?: boolean
  limit?: number
  offset?: number
}

export async function getAllUsers(filters: UserFilters = {}) {
  if (USE_MOCK) {
    let users = [...MOCK_USERS]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      users = users.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.full_name?.toLowerCase().includes(q))
      )
    }
    if (filters.bannedOnly) {
      const bannedIds = new Set(MOCK_BANS.filter(b => b.is_active).map(b => b.user_id))
      users = users.filter(u => bannedIds.has(u.id))
    }
    const offset = filters.offset || 0
    const limit = filters.limit || 20
    return { data: users.slice(offset, offset + limit), count: users.length }
  }

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_admin', false)

  if (filters.search) {
    query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
  }

  const limit = filters.limit || 20
  const offset = filters.offset || 0
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as Profile[], count: count ?? 0 }
}

export async function warnUser(userId: string, adminId: string, reason: string, severity = 1, reportId?: string) {
  if (USE_MOCK) {
    const w: UserWarning = {
      id: `warn_mock_${Date.now()}`, user_id: userId, admin_id: adminId,
      report_id: reportId || null, reason, severity, acknowledged: false,
      created_at: new Date().toISOString(),
    }
    MOCK_WARNINGS.unshift(w)
    return w
  }
  const insert: UserWarningInsert = { user_id: userId, admin_id: adminId, reason, severity }
  if (reportId) insert.report_id = reportId
  const { data, error } = await supabase.from('user_warnings').insert(insert).select().single()
  if (error) throw error
  return data as UserWarning
}

export async function getUserWarnings(userId: string) {
  if (USE_MOCK) return MOCK_WARNINGS.filter(w => w.user_id === userId)
  const { data, error } = await supabase
    .from('user_warnings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as UserWarning[]
}

export async function banUser(userId: string, adminId: string, reason: string, expiresAt?: string) {
  if (USE_MOCK) {
    const b: UserBan = {
      id: `ban_mock_${Date.now()}`, user_id: userId, admin_id: adminId,
      reason, banned_at: new Date().toISOString(), expires_at: expiresAt || null,
      is_active: true, unbanned_at: null, unbanned_by: null, created_at: new Date().toISOString(),
    }
    MOCK_BANS.push(b)
    return b
  }
  const insert: UserBanInsert = { user_id: userId, admin_id: adminId, reason }
  if (expiresAt) insert.expires_at = expiresAt
  const { data, error } = await supabase.from('user_bans').insert(insert).select().single()
  if (error) throw error
  return data as UserBan
}

export async function unbanUser(banId: string, adminId: string) {
  if (USE_MOCK) {
    const ban = MOCK_BANS.find(b => b.id === banId)
    if (ban) {
      ban.is_active = false
      ban.unbanned_at = new Date().toISOString()
      ban.unbanned_by = adminId
    }
    return ban
  }
  const { data, error } = await supabase
    .from('user_bans')
    .update({ is_active: false, unbanned_at: new Date().toISOString(), unbanned_by: adminId })
    .eq('id', banId)
    .select()
    .single()
  if (error) throw error
  return data as UserBan
}

export async function getUserBans(userId: string) {
  if (USE_MOCK) return MOCK_BANS.filter(b => b.user_id === userId)
  const { data, error } = await supabase
    .from('user_bans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as UserBan[]
}

export function isUserBannedMock(userId: string): boolean {
  return MOCK_BANS.some(b => b.user_id === userId && b.is_active)
}

// ─── AI Moderation Logs ─────────────────────────────

export async function getAiLogs(filters: { flaggedOnly?: boolean; limit?: number } = {}) {
  if (USE_MOCK) {
    let logs = [...MOCK_AI_LOGS]
    if (filters.flaggedOnly) logs = logs.filter(l => l.is_flagged)
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return logs.slice(0, filters.limit || 50)
  }

  let query = supabase
    .from('ai_moderation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters.limit || 50)

  if (filters.flaggedOnly) query = query.eq('is_flagged', true)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as AiModerationLog[]
}

// ─── Stats ──────────────────────────────────────────

export async function getModerationStats() {
  if (USE_MOCK) return MOCK_STATS

  // Real implementation — aggregate from tables
  const [
    { count: pendingCount },
    { count: totalCount },
    { data: bansData },
    { data: aiTodayData },
  ] = await Promise.all([
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }),
    supabase.from('user_bans').select('id').eq('is_active', true),
    supabase.from('ai_moderation_logs').select('id').eq('is_flagged', true)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  // Resolved today
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const { count: resolvedTodayCount } = await supabase
    .from('moderation_reports')
    .select('*', { count: 'exact', head: true })
    .gte('resolved_at', todayStart)

  return {
    pendingReports: pendingCount ?? 0,
    resolvedToday: resolvedTodayCount ?? 0,
    activeBans: bansData?.length ?? 0,
    aiFlagsToday: aiTodayData?.length ?? 0,
    totalReports: totalCount ?? 0,
    avgResolutionMinutes: 0,
    reportsByReason: MOCK_STATS.reportsByReason, // TODO: aggregate from DB
    reportsOverTime: MOCK_STATS.reportsOverTime, // TODO: aggregate from DB
  }
}
