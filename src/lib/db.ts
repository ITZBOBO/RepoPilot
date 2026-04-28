/**
 * Server-side Supabase query helpers.
 * All functions use supabaseAdmin (service role) — never call from client components.
 */
import { supabaseAdmin } from './supabase'

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getOrCreateUser(params: {
  githubUsername: string
  email:          string | null
  avatarUrl:      string | null
  githubToken:    string
}): Promise<{ user: { id: string; github_username: string; email: string | null; avatar_url: string | null }; isNew: boolean }> {
  const { githubUsername, email, avatarUrl, githubToken } = params

  // Check if user already exists
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, github_username, email, avatar_url')
    .eq('github_username', githubUsername)
    .single()

  if (existing) {
    // Update token + avatar on every login (token rotates)
    await supabaseAdmin
      .from('users')
      .update({ github_token: githubToken, avatar_url: avatarUrl })
      .eq('github_username', githubUsername)
    return { user: existing, isNew: false }
  }

  // New user — insert
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ github_username: githubUsername, email, avatar_url: avatarUrl, github_token: githubToken })
    .select('id, github_username, email, avatar_url')
    .single()

  if (error) throw new Error(`DB insert user failed: ${error.message}`)
  return { user: data, isNew: true }
}

export async function getUserByUsername(githubUsername: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, github_username, email, avatar_url, github_token')
    .eq('github_username', githubUsername)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(`DB get user failed: ${error.message}`)
  return data ?? null
}

// ─── Schedulers ───────────────────────────────────────────────────────────────

export async function getSchedulers(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('scheduled_commits')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`DB get schedulers failed: ${error.message}`)
  return data ?? []
}

export async function createScheduler(params: {
  userId:         string
  repoName:       string
  repoFullName:   string
  cronExpression: string
  description:    string
  language:       string
  filePath:       string
}) {
  const { data, error } = await supabaseAdmin
    .from('scheduled_commits')
    .insert({
      user_id:         params.userId,
      repo_name:       params.repoName,
      repo_full_name:  params.repoFullName,
      cron_expression: params.cronExpression,
      description:     params.description,
      language:        params.language,
      file_path:       params.filePath,
      status:          'active',
    })
    .select()
    .single()

  if (error) throw new Error(`DB create scheduler failed: ${error.message}`)
  return data
}

export async function updateSchedulerStatus(id: string, status: 'active' | 'paused' | 'deleted') {
  const { error } = await supabaseAdmin
    .from('scheduled_commits')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(`DB update scheduler failed: ${error.message}`)
}

export async function getSchedulerWithUser(schedulerId: string) {
  const { data, error } = await supabaseAdmin
    .from('scheduled_commits')
    .select('*, users(id, github_username, github_token)')
    .eq('id', schedulerId)
    .single()

  if (error) throw new Error(`DB get scheduler failed: ${error.message}`)
  return data
}

export async function getAllActiveSchedulers() {
  const { data, error } = await supabaseAdmin
    .from('scheduled_commits')
    .select('*, users(id, github_username, github_token)')
    .eq('status', 'active')

  if (error) throw new Error(`DB get active schedulers failed: ${error.message}`)
  return data ?? []
}

// ─── Commit Logs ──────────────────────────────────────────────────────────────

export async function logCommit(params: {
  schedulerId:   string
  commitSha:     string | null
  commitMessage: string
  filePath:      string
  success:       boolean
  errorMessage?: string
}) {
  const { error } = await supabaseAdmin
    .from('commit_logs')
    .insert({
      scheduler_id:   params.schedulerId,
      commit_sha:     params.commitSha,
      commit_message: params.commitMessage,
      file_path:      params.filePath,
      success:        params.success,
      error_message:  params.errorMessage ?? null,
    })

  if (error) throw new Error(`DB log commit failed: ${error.message}`)
}

export async function getCommitLogs(schedulerId: string, limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('commit_logs')
    .select('*')
    .eq('scheduler_id', schedulerId)
    .order('ran_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`DB get commit logs failed: ${error.message}`)
  return data ?? []
}

export async function getRecentCommitLogs(userId: string, limit = 5) {
  // Join through scheduled_commits to filter by user
  const { data, error } = await supabaseAdmin
    .from('commit_logs')
    .select('*, scheduled_commits!inner(user_id, repo_name, file_path)')
    .eq('scheduled_commits.user_id', userId)
    .order('ran_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`DB get recent logs failed: ${error.message}`)
  return data ?? []
}

export async function incrementCommitCount(schedulerId: string) {
  const { error } = await supabaseAdmin.rpc('increment_commit_count', {
    scheduler_id: schedulerId,
  })
  if (error) throw new Error(`DB increment commit count failed: ${error.message}`)
}

export async function updateSchedulerLastRun(schedulerId: string) {
  const { error } = await supabaseAdmin
    .from('scheduled_commits')
    .update({ last_run_at: new Date().toISOString() })
    .eq('id', schedulerId)

  if (error) throw new Error(`DB update last_run_at failed: ${error.message}`)
}

// ─── User Preferences ─────────────────────────────────────────────────────────

/**
 * Persist career preferences (skill level + primary goal) to the users table.
 * Called from POST /api/settings/preferences — server-side only.
 */
export async function updateUserPreferences(
  githubUsername: string,
  prefs: { skillLevel: string; goal: string; stack: string[] },
) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      skill_level: prefs.skillLevel,
      goal:        prefs.goal,
      stack:       prefs.stack,
    })
    .eq('github_username', githubUsername)

  if (error) throw new Error(`DB update preferences failed: ${error.message}`)
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

export async function saveSuggestion(githubUsername: string, content: string) {
  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('github_username', githubUsername)
    .single()

  if (!userRow) throw new Error('User not found for suggestions')

  const { error } = await supabaseAdmin
    .from('suggestions')
    .insert({
      user_id: userRow.id,
      content,
    })

  if (error) throw new Error(`DB insert suggestion failed: ${error.message}`)
}

// ─── Streak Shield ────────────────────────────────────────────────────────────

export async function setStreakShield(githubUsername: string, enabled: boolean) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ streak_shield_enabled: enabled })
    .eq('github_username', githubUsername)

  if (error) throw new Error(`DB update streak shield failed: ${error.message}`)
}

export async function getShieldEnabledUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, github_username, github_token')
    .eq('streak_shield_enabled', true)
    .not('github_token', 'is', null)

  if (error) throw new Error(`DB get shield users failed: ${error.message}`)
  return data ?? []
}



