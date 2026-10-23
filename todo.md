# todo.md — golki Jira clone

Read the Principles section of the poteto-mode skill first.

Phase A (Frame): done — see PLAN.md Phase A.
Phase B (Design workflow): done — see PLAN.md Phase B.
Phase C (Run loop): execute project phases 0-11 per PLAN.md, verifying each before next.
Phase D (Audit trail): show-me-your-work TSV per phase.
Phase E (Verify & hand back): final predicate check + encode lessons.

Project phases (concrete):
- [x] 0 Bootstrap & tooling (bun, Next 16, TS strict, Tailwind v4, Biome, Vitest, Prisma, Postgres)
- [x] 1 Design system & tokens (ADS tokens -> Tailwind, dark mode, primitives)
- [x] 2 Data model & server layer (Prisma schema, repos, seeds)
- [x] 3 Auth & workspace/project CRUD
- [x] 4 Issue CRUD & detail
- [x] 5 Board (kanban) + drag-and-drop (pragmatic-dnd)
- [x] 6 Backlog & sprints (basic)
- [x] 7 Search & filters (basic)
- [~] 8 Realtime (optional, skipped for MVP)
- [x] 9 Polish & a11y (dark mode, security headers, tests)
- [x] 10 Testing & verification (unit + smoke E2E)
- [x] 11 Production hardening (headers, env)
