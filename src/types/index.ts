// ─── User & Auth ───────────────────────────────────────
export type Plan = 'FREE' | 'PRO' | 'LIFETIME'

export interface User {
  id: string
  name: string
  email: string
  githubHandle?: string
  githubToken?: string
  plan: Plan
  initials: string
  avatarUrl?: string
  skillLevel?: SkillLevel
  goal?: GoalType
  stack?: string[]
  createdAt?: string
}

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type GoalType = 'internship' | 'job' | 'freelance' | 'learning'

// ─── Suggestions ───────────────────────────────────────
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface Suggestion {
  id: string
  name: string
  description: string
  whyItFits: string
  difficulty: Difficulty
  estimatedDays: number
  fitScore: number
  emoji: string
  stack: string[]
  tags: string[]
  saved: boolean
  selected: boolean
  features: string[]
}

// ─── Projects & Tasks ──────────────────────────────────
export type ProjectStatus = 'ACTIVE' | 'COMPLETE' | 'PAUSED' | 'ARCHIVED'
export type PhaseStatus   = 'PENDING' | 'ACTIVE' | 'DONE'
export type TaskType      = 'CODE' | 'CONFIG' | 'DESIGN' | 'WRITE' | 'DEPLOY' | 'TEST'

export interface Task {
  id: string
  title: string
  type: TaskType
  done: boolean
  hint?: string
}

export interface Phase {
  id: string
  number: number
  title: string
  dayLabel: string
  status: PhaseStatus
  order: number
  tasks: Task[]
}

export interface Project {
  id: string
  name: string
  emoji: string
  description: string
  stack: string[]
  difficulty: Difficulty
  estimatedDays: number
  startedAt: string
  status: ProjectStatus
  phases: Phase[]
}

// ─── Repo Assets ───────────────────────────────────────
export type Visibility = 'PUBLIC' | 'PRIVATE'

export interface CommitItem {
  type: string
  message: string
  phase: string
}

export interface RepoAsset {
  id: string
  projectId: string
  repoName: string
  description: string
  visibility: Visibility
  topics: string[]
  readmeContent: string
  commitPlan: CommitItem[]
  githubIssues: string[]
  githubUrl: string | null
  publishedAt: string | null
}

// ─── Commit Scheduler ──────────────────────────────────
export type CommitStatus = 'PENDING' | 'SCHEDULED' | 'PUSHED' | 'FAILED'

export interface ScheduledCommit {
  id: string
  projectId: string
  message: string
  type: string
  code?: string
  fileName?: string
  scheduledFor: string
  status: CommitStatus
  pushed: boolean
  pushedAt?: string
}

// ─── Supabase DB Types ─────────────────────────────────
export interface Scheduler {
  id:              string
  user_id:         string
  repo_name:       string
  repo_full_name:  string
  cron_expression: string
  description:     string
  language:        string
  file_path:       string
  status:          'active' | 'paused' | 'deleted'
  last_run_at:     string | null
  next_run_at:     string | null
  total_commits:   number
  created_at:      string
}

export interface CommitLog {
  id:             string
  scheduler_id:   string
  commit_sha:     string | null
  commit_message: string
  file_path:      string
  ran_at:         string
  success:        boolean
  error_message:  string | null
}

// ─── Portfolio ─────────────────────────────────────────
export interface PortfolioDimension {
  label: string
  score: number
  max: number
  color: string
  icon: string
  tip: string
}

// ─── Stats ─────────────────────────────────────────────
export interface AppStats {
  suggestionsCount: number
  projectsBuilt: number
  draftsCount: number
  portfolioScore: number
}

// ─── API responses ─────────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
  fallback?: boolean
}
