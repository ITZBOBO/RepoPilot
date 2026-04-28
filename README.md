# RepoPilot

AI-powered GitHub assistant. Helps developers decide what to build next.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to /dashboard automatically.

## Pages

| Route | Page |
|---|---|
| /dashboard | Main dashboard |
| /suggestions | AI project suggestions |
| /quick-prompts | Guided prompt builder |
| /projects/p1 | Project detail + task tracker |
| /roadmap/p1 | Visual build roadmap |
| /generator | README + commit plan generator |
| /publish | GitHub publisher |
| /onboarding | User onboarding flow |
| /auth/login | Login |
| /auth/register | Sign up |

## Stack

Next.js 14 · TypeScript · Tailwind CSS · App Router

All data is mocked in `src/data/mock.ts` — swap in real API calls later.
