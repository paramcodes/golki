# PLAN.md — Jira Clone (golki) Multi-Stage Plan

Methodology: figure-it-out (Phase A-E) + spec (5-phase interrogation). Rigor: high (one-way doors: data model, auth, design tokens). Verification: real artifact, not self-report. Stack per AGENTS.md/DESIGN.md.

## Phase A — Frame (done in this doc)

- Definition of done (falsifiable): A user can sign up, create a workspace+project, create issues, drag them across a kanban board, comment, and filter; dark mode works; Biome+tsc+Vitest green; agent-browser+Lightpanda E2E green on real running app.
- Scope: ~12 phases, ~60-90 dev-hours solo, ~3-4x with agents. Blockers: Atlassian Sans unavailable (system fallback), React 18 if using Atlaskit editor (we use Tiptap), Compiled CSS (we port tokens to Tailwind instead).
- Rigor: high for data model/auth/tokens; medium for UI polish.

## Phase B — Design workflow (riskiest-unknown first)

Order: tooling → design tokens/primitives → data model → auth → issue CRUD → board DnD → backlog/sprint → search → realtime → polish → tests → hardening.
Verification harness before features: Vitest + Testing Library + agent-browser/Lightpanda E2E skeleton with baseline screenshots.

## Project phases (execute in order; each ends in verifiable state)

### 0. Bootstrap & tooling

- bun + Next.js 15 + TS strict + Tailwind v4 + Biome + Vitest + Prisma + Postgres (docker).
- HeroUI v3 (or shadcn) + @atlaskit/tokens/css-reset + pragmatic-dnd.
- package.json scripts (golden commands), tsconfig strict, biome.json, .env.example.
- Verify: `bun run check && bun run typecheck && bun run test` green on empty app; dev server boots.

### 1. Design system & tokens

- Port ADS tokens to Tailwind @theme (colors, space, radius, typography, elevation, motion) per DESIGN.md.
- Dark mode toggle (data-color-mode/data-theme) + persistence.
- Primitives: Button, Modal, Dropdown, Tabs, Avatar, Lozenge, Tag, Badge, Input, Textarea, Select, Tooltip, EmptyState, Spinner, Skeleton.
- Verify: Storybook/preview page renders all primitives in light+dark; token lint (Biome) passes.

### 2. Data model & server layer

- Prisma schema: User, Account, Session (Auth.js), Workspace, WorkspaceMember, Project, Issue (with status/priority/type/estimate), Sprint, Comment, Label, IssueLabel, Attachment.
- Branded IDs in shared/types.
- Repositories (server/repositories/*) + Zod schemas.
- Verify: `bun run db:push && bun run db:seed`; seed creates demo workspace/project/issues.

### 3. Auth & workspace/project CRUD

- Auth.js (email+password or OAuth). Login/signup pages.
- Workspace switcher, create workspace, invite member (basic).
- Project create/edit with key, name, type (scrum/kanban), lead.
- Verify: E2E signup→create project; tsc clean.

### 4. Issue CRUD & detail

- Create issue (modal or inline), edit fields, delete.
- Issue detail modal: title, description (Tiptap), status, assignee, reporter, priority, type, labels, sprint, estimate, dates, comments.
- Comments add/edit/delete with @mention (basic).
- Verify: E2E create issue→open detail→edit→comment; unit tests for repos.

### 5. Board (kanban) + drag-and-drop

- Columns (status-based or custom), horizontal scroll.
- Issue cards (raised surface) with key, summary, type/priority icons, assignee avatar, labels, estimate, due.
- Drag cards within/across columns via @atlaskit/pragmatic-drag-and-drop (authentic Jira feel), FLIP, ghost placeholder.
- Column add/rename/reorder/delete; WIP limits (optional).
- Filters on board (assignee, type, priority, label, text).
- Verify: E2E drag card persists new status; unit tests for moveCard logic.

### 6. Backlog & sprints

- Backlog list (virtualized) with drag to reorder/prioritize.
- Sprint create/start/complete; move issues into sprint.
- Burndown (optional, later).
- Verify: E2E create sprint→move issues→start.

### 7. Search & filters (JQL-lite)

- Global search bar; filter by project, status, assignee, label, text.
- Saved filters (basic).
- Verify: E2E search returns expected issues.

### 8. Realtime (optional, phase-gated)

- Live board updates via Supabase Realtime or SSE when issue changes.
- Conflict handling (last-write-wins + toast).
- Verify: two tabs reflect change.

### 9. Polish & a11y

- Motion (modal, list, drag), reduced-motion.
- Keyboard nav, focus rings, screen-reader labels.
- Empty states, loading skeletons, error boundaries.
- Dark mode audit.
- Verify: Lighthouse/a11y checks; manual keyboard walkthrough.

### 10. Testing & verification

- Unit: logic (moveCard, filters, zod schemas).
- Component: primitives + key feature components.
- E2E: auth, project, issue CRUD, board drag, search (agent-browser + Lightpanda).
- Verify: all green in CI; coverage threshold (e.g. 70% logic).

### 11. Production hardening

- Security audit (cso): auth, RLS/DB, secrets, headers.
- Env validation, error monitoring, rate limiting.
- Deploy (Vercel) + DB (Neon/Supabase).
- Verify: deploy preview works; smoke E2E on preview.

## Phase C — Run loop

Each phase = hypothesis → smallest change → measure against predicate on real artifact → keep/revert. Verify each before next. Pair delegated work with judge; harden gate if gamed.

## Phase D — Audit trail

Log via show-me-your-work (TSV) committed when reviewer needs trail. Each phase lands a row: what, why, evidence, result.

## Phase E — Verify & hand back

Check whole against Phase A predicate on real product. Encode recurring corrections as Biome rules/tests/scripts.

## Dependencies / order

0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → (8 optional) → 9 → 10 → 11.
Parallelizable: 1 (primitives) can overlap 2 (data model) after 0. 9 (polish) can start after 5.

## Risks

- Atlaskit token bundling weight → port only needed tokens.
- Pragmatic DnD keyboard a11y → add @dnd-kit only if needed (decide in phase 5).
- Lightpanda missing Web APIs in E2E → Chrome fallback documented per spec.
- React 19 vs Atlaskit (React 18) → avoid Atlaskit components except tokens/pragmatic-dnd/tokens.

## Next action

Start Phase 0 (bootstrap) when approved.
