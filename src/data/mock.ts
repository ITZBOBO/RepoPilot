// ─── Mock data used across all pages in dev mode ───────────────────────────

export const mockUser = {
  id: 'user_1',
  name: 'Bobo Agboola',
  email: 'bobo@redeemers.edu.ng',
  githubHandle: 'bobo-agboola',
  plan: 'FREE' as const,
  initials: 'BA',
}

export const mockSuggestions = [
  {
    id: 's1',
    name: 'Finance Dashboard UI',
    description: 'A responsive personal finance tracker with income charts, spending analysis, and savings goal tracking. Exactly the kind of data-heavy project that makes recruiters stop scrolling.',
    whyItFits: 'Showcases React + Recharts — your strongest combo right now.',
    difficulty: 'INTERMEDIATE' as const,
    estimatedDays: 6,
    fitScore: 90,
    emoji: '💰',
    stack: ['React', 'Tailwind CSS', 'Recharts', 'Vite'],
    tags: ['dashboard', 'fintech', 'charts'],
    saved: false,
    selected: false,
    features: ['Income vs expense charts', 'Monthly budget tracker', 'Savings goals progress', 'Transaction history table', 'Dark/light mode toggle'],
  },
  {
    id: 's2',
    name: 'Job Application Tracker',
    description: 'A Kanban-style job hunt manager to track applications, interviews, and follow-ups. Meta and self-referential — great for CS students on the job hunt.',
    whyItFits: 'Directly relevant to your current situation and shows product thinking.',
    difficulty: 'INTERMEDIATE' as const,
    estimatedDays: 5,
    fitScore: 85,
    emoji: '📋',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'LocalStorage'],
    tags: ['productivity', 'kanban', 'career'],
    saved: true,
    selected: false,
    features: ['Drag & drop Kanban board', 'Application status tracking', 'Interview date reminders', 'Company notes', 'Export to CSV'],
  },
  {
    id: 's3',
    name: 'Dev Portfolio v2',
    description: 'A next-level personal portfolio with 3D animations, project showcases, and a live GitHub stats section. The one page every recruiter will actually spend time on.',
    whyItFits: 'High visual impact — perfect for standing out in applications.',
    difficulty: 'ADVANCED' as const,
    estimatedDays: 8,
    fitScore: 78,
    emoji: '🎨',
    stack: ['Next.js', 'Three.js', 'Tailwind CSS', 'Framer Motion'],
    tags: ['portfolio', '3d', 'animation'],
    saved: false,
    selected: false,
    features: ['3D hero section', 'Animated project cards', 'GitHub contribution graph', 'Skills radar chart', 'Contact form with email'],
  },
  {
    id: 's4',
    name: 'Restaurant Landing Page',
    description: 'A premium restaurant website with menu showcase, online reservations, and Google Maps integration. Great for freelance portfolio — exactly what clients ask for.',
    whyItFits: 'Directly maps to freelance work you can sell immediately.',
    difficulty: 'BEGINNER' as const,
    estimatedDays: 3,
    fitScore: 82,
    emoji: '🍽️',
    stack: ['React', 'Tailwind CSS', 'Google Maps API'],
    tags: ['freelance', 'landing-page', 'business'],
    saved: false,
    selected: false,
    features: ['Hero with video background', 'Interactive menu sections', 'Reservation form', 'Google Maps embed', 'Mobile-first responsive'],
  },
  {
    id: 's5',
    name: 'Movie Discovery App',
    description: 'Search, browse and save movies using the TMDB API. Includes watchlist, ratings, and a recommendation engine. Strong API integration project with real public data.',
    whyItFits: 'Proves you can work with third-party APIs — a key junior dev skill.',
    difficulty: 'BEGINNER' as const,
    estimatedDays: 4,
    fitScore: 74,
    emoji: '🎬',
    stack: ['React', 'TMDB API', 'Tailwind CSS', 'React Query'],
    tags: ['entertainment', 'api', 'search'],
    saved: false,
    selected: false,
    features: ['Search with debounce', 'Movie detail pages', 'Watchlist with persistence', 'Genre filtering', 'Trending & popular sections'],
  },
  {
    id: 's6',
    name: 'AI Prompt Builder',
    description: 'A tool that helps non-technical users craft better AI prompts through guided templates and examples. Timely, relevant, and shows you understand the AI wave.',
    whyItFits: 'Positions you as an AI-aware developer — massively in demand right now.',
    difficulty: 'INTERMEDIATE' as const,
    estimatedDays: 5,
    fitScore: 88,
    emoji: '🤖',
    stack: ['React', 'OpenAI API', 'Tailwind CSS', 'Zustand'],
    tags: ['ai', 'productivity', 'tools'],
    saved: false,
    selected: false,
    features: ['Template library', 'Variable substitution', 'Live preview', 'One-click copy', 'Prompt history'],
  },
]

export const mockActiveProject = {
  id: 'p1',
  name: 'Finance Dashboard UI',
  emoji: '💰',
  description: 'A responsive personal finance tracker built with React, Tailwind CSS, and Recharts.',
  stack: ['React', 'Tailwind CSS', 'Recharts', 'Vite'],
  difficulty: 'INTERMEDIATE' as const,
  estimatedDays: 6,
  startedAt: '2025-03-01',
  status: 'ACTIVE' as const,
  phases: [
    {
      id: 'ph1', number: 1, title: 'Setup & Structure', dayLabel: 'Day 1',
      status: 'DONE' as const, order: 1,
      tasks: [
        { id: 't1', title: 'Initialise project with Vite', type: 'CONFIG' as const, done: true, hint: 'npm create vite@latest finance-dashboard --template react' },
        { id: 't2', title: 'Configure Tailwind CSS', type: 'CONFIG' as const, done: true, hint: 'npm install -D tailwindcss postcss autoprefixer' },
        { id: 't3', title: 'Set up folder structure', type: 'CONFIG' as const, done: true, hint: 'src/components, src/pages, src/data, src/hooks' },
        { id: 't4', title: 'Install Recharts and dependencies', type: 'CONFIG' as const, done: true, hint: 'npm install recharts' },
        { id: 't5', title: 'Create mock data file', type: 'CODE' as const, done: true, hint: 'Add monthly income, expenses, transactions arrays' },
      ],
    },
    {
      id: 'ph2', number: 2, title: 'Layout Shell', dayLabel: 'Day 2',
      status: 'DONE' as const, order: 2,
      tasks: [
        { id: 't6', title: 'Build sidebar navigation', type: 'CODE' as const, done: true, hint: 'Fixed sidebar with nav links and user profile at bottom' },
        { id: 't7', title: 'Build topbar with breadcrumbs', type: 'CODE' as const, done: true, hint: 'Sticky topbar with page title and action buttons' },
        { id: 't8', title: 'Create responsive grid layout', type: 'CODE' as const, done: true, hint: 'Main content area + right sidebar on desktop' },
        { id: 't9', title: 'Add dark mode base styles', type: 'DESIGN' as const, done: true, hint: 'Navy/slate colour palette, CSS variables' },
      ],
    },
    {
      id: 'ph3', number: 3, title: 'Dashboard & Charts', dayLabel: 'Day 3',
      status: 'ACTIVE' as const, order: 3,
      tasks: [
        { id: 't10', title: 'Build stat cards row (4 cards)', type: 'CODE' as const, done: true, hint: 'Total income, expenses, savings, net worth' },
        { id: 't11', title: 'Add area chart for monthly income/expenses', type: 'CODE' as const, done: false, hint: 'Use Recharts AreaChart with custom tooltip' },
        { id: 't12', title: 'Add pie chart for spending categories', type: 'CODE' as const, done: false, hint: 'PieChart with custom legend' },
        { id: 't13', title: 'Build savings goals progress bars', type: 'CODE' as const, done: false, hint: 'Custom ProgressBar component with percentage labels' },
      ],
    },
    {
      id: 'ph4', number: 4, title: 'Transactions & Budget', dayLabel: 'Days 4–5',
      status: 'PENDING' as const, order: 4,
      tasks: [
        { id: 't14', title: 'Build transactions table with filters', type: 'CODE' as const, done: false, hint: 'Search, category filter, date sort' },
        { id: 't15', title: 'Add budget tracker section', type: 'CODE' as const, done: false, hint: 'Monthly budget vs actual per category' },
        { id: 't16', title: 'Build add transaction modal', type: 'CODE' as const, done: false, hint: 'Form with amount, category, date, notes' },
        { id: 't17', title: 'Add LocalStorage persistence', type: 'CODE' as const, done: false, hint: 'Save and load transactions from localStorage' },
      ],
    },
    {
      id: 'ph5', number: 5, title: 'Polish & Publish', dayLabel: 'Days 6–7',
      status: 'PENDING' as const, order: 5,
      tasks: [
        { id: 't18', title: 'Add responsive mobile view', type: 'DESIGN' as const, done: false, hint: 'Collapsible sidebar, stacked cards on mobile' },
        { id: 't19', title: 'Write README with screenshots', type: 'WRITE' as const, done: false, hint: 'Badges, features, install guide, screenshots' },
        { id: 't20', title: 'Deploy to Vercel', type: 'DEPLOY' as const, done: false, hint: 'Connect GitHub repo, auto-deploy on push' },
        { id: 't21', title: 'Add live demo URL to README', type: 'WRITE' as const, done: false, hint: 'Update README with Vercel URL' },
        { id: 't22', title: 'Push final version to GitHub', type: 'DEPLOY' as const, done: false, hint: 'Final commit: "feat: complete finance dashboard"' },
      ],
    },
  ],
}

export const mockRepoAsset = {
  id: 'ra1',
  projectId: 'p1',
  repoName: 'finance-dashboard-ui',
  description: 'A responsive personal finance dashboard built with React, Tailwind CSS, and Recharts. Track income, expenses, and savings goals.',
  visibility: 'PUBLIC' as const,
  topics: ['react', 'tailwindcss', 'recharts', 'dashboard', 'finance', 'vite'],
  readmeContent: `# 💰 Finance Dashboard UI

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

A responsive personal finance tracker built with React, Tailwind CSS, and Recharts.

## Features
- 📊 Income vs expense area charts
- 🥧 Spending category pie chart
- 🎯 Savings goals with progress bars
- 💳 Transaction history with filtering
- 📱 Fully responsive

## Getting Started
\`\`\`bash
git clone https://github.com/bobo-agboola/finance-dashboard-ui
cd finance-dashboard-ui
npm install
npm run dev
\`\`\`

## License
MIT`,
  commitPlan: [
    { type: 'init', message: 'setup project with React, Vite, and Tailwind CSS', phase: 'Phase 1' },
    { type: 'feat', message: 'add mock data and project folder structure', phase: 'Phase 1' },
    { type: 'feat', message: 'build sidebar navigation and topbar layout', phase: 'Phase 2' },
    { type: 'style', message: 'implement dark navy design system and CSS variables', phase: 'Phase 2' },
    { type: 'feat', message: 'add stat cards row with income, expense, savings data', phase: 'Phase 3' },
    { type: 'feat', message: 'implement area chart for monthly income and expenses', phase: 'Phase 3' },
    { type: 'feat', message: 'add pie chart for spending category breakdown', phase: 'Phase 3' },
    { type: 'feat', message: 'build transactions table with search and category filter', phase: 'Phase 4' },
    { type: 'feat', message: 'add budget tracker with monthly vs actual comparison', phase: 'Phase 4' },
    { type: 'feat', message: 'implement localStorage persistence for transactions', phase: 'Phase 4' },
    { type: 'style', message: 'add responsive mobile layout and collapsible sidebar', phase: 'Phase 5' },
    { type: 'docs', message: 'write README with screenshots and setup guide', phase: 'Phase 5' },
  ],
  githubIssues: [
    'Set up project structure and configure Vite + Tailwind build tools',
    'Build layout shell: sidebar navigation, topbar, and main grid',
    'Implement dashboard charts: area chart, pie chart, savings goals',
    'Build transactions table and budget tracker with filters',
    'Polish: responsive design, README, deploy to Vercel',
  ],
  githubUrl: null,
  publishedAt: null,
}

export const mockStats = {
  suggestionsCount: 6,
  projectsBuilt: 3,
  draftsCount: 2,
  portfolioScore: 62,
}

export const mockPastPublished = [
  { id: 'pp1', name: 'restaurant-landing-page', emoji: '🍽️', daysAgo: 8, stack: 'HTML, CSS, JS', githubUrl: '#' },
  { id: 'pp2', name: 'quiz-app-react', emoji: '🎮', daysAgo: 21, stack: 'React, CSS', githubUrl: '#' },
  { id: 'pp3', name: 'movie-search-app', emoji: '🎬', daysAgo: 30, stack: 'React, OMDB API', githubUrl: '#' },
]
