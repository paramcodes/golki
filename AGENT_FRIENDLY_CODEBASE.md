# Agent-Friendly Codebase Design for Jira Clone

## 1. Principles (what makes it agent-friendly)

1. **AGENTS.md is the contract** — one canonical file at root (~150-200 lines) with commands, structure, conventions, "do not" rules. Adapters (`CLAUDE.md`, `.cursorrules`, `.windsurfrules`) symlink/point to it. Per-directory `AGENTS.md` only for complex domains (board, editor).
2. **llms.txt** at root/public for "where to look" pointers (not full dump).
3. **Strict TS** (`strict: true`, `noUncheckedIndexedAccess`, branded IDs) — agents pattern-match on types; weak types → hallucination.
4. **Co-located tests** (`foo.ts` + `foo.test.ts`) — agent sees contract next to impl.
5. **Feature modules** — each feature owns components/hooks/api/types/tests; no cross-feature imports except via `shared/`.
6. **Small, single-purpose files** (~150 lines max target); no god files.
7. **Consistent naming**: kebab-case files, PascalCase components, `useX` hooks, `*.test.ts`.
8. **CI parity**: local commands == CI commands (Biome, tsc, vitest, agent-browser e2e). Agents run what CI runs.
9. **Generated code isolated & gitignored** (`src/generated/`, `.next/`, `prisma/migrations/` auto). AGENTS.md says "never edit".
10. **Decision comments only** ("why not X") at unusual choices; no narration (deslop/no-comments).
11. **Parse at boundaries** (Zod at API/DB edges), trust internal types.
12. **Deep modules**: small public interface, complex internals (codebase-design vocabulary).
13. **No barrel hell**: import from leaf modules, not index re-exports where it hurts tree-shaking; but feature `index.ts` allowed for public API.
14. **Deterministic scripts**: `bun run dev`, `bun run test`, `bun run check`, `bun run e2e` — golden path.

## 2. Tooling (per your prefs)

- **Lint + format**: Biome (`biome check --write`). Replaces ESLint+Prettier. Tabs? Use spaces (2) to match Prettier default; set in biome.json.
- **Type check**: `tsc --noEmit`.
- **Unit/integration**: Vitest + Testing Library.
- **E2E**: **agent-browser** (Vercel, Rust CLI) + **Lightpanda** (Zig headless, 9x faster, 16x less RAM) via CDP. Connect Lightpanda as CDP endpoint: `chromium.connectOverCDP('ws://127.0.0.1:9222')` (Playwright client can drive Lightpanda) OR use agent-browser's built-in Lightpanda engine option. agent-browser supports local engines including Lightpanda (dashboard shows "local engines (Chrome, Lightpanda)").
- **DB**: Prisma + Postgres; migrations committed.
- **Auth**: Auth.js (or Clerk).
- **State**: Zustand (client) + TanStack Query (server).
- **UI**: HeroUI v3 (or shadcn) + Tailwind v4 + ADS tokens.
- **DnD**: `@atlaskit/pragmatic-drag-and-drop`.
- **Editor**: Tiptap (or Atlaskit editor-core if React 18 pinned).

## 3. File tree (agent-friendly, feature-based)

```
golki/
├── AGENTS.md                          # canonical agent contract (~150-200 lines)
├── CLAUDE.md                          # adapter -> AGENTS.md (symlink or pointer)
├── .cursorrules                       # adapter -> AGENTS.md
├── .windsurfrules                     # adapter -> AGENTS.md
├── llms.txt                           # "where to look" pointers
├── biome.json                         # lint + format config
├── tsconfig.json                      # strict
├── next.config.ts
├── tailwind.config.ts                 # (or v4 @theme in css)
├── package.json                       # scripts = golden path
├── .env.example
├── .gitignore
│
├── prisma/
│   ├── schema.prisma                  # data model (source of truth)
│   └── seed.ts
│
├── src/
│   ├── app/                           # Next.js App Router (routes only, thin)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (workspace)/
│   │   │   ├── [workspaceSlug]/
│   │   │   │   ├── projects/page.tsx
│   │   │   │   └── projects/[projectKey]/
│   │   │   │       ├── board/page.tsx
│   │   │   │       ├── backlog/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── [...]/route.ts         # thin handlers -> features/*/api
│   │   ├── layout.tsx
│   │   └── globals.css                # ADS tokens -> Tailwind @theme
│   │
│   ├── features/                      # feature modules (the meat)
│   │   ├── auth/
│   │   │   ├── AGENTS.md             # per-feature contract (only if complex)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/                  # server actions / route handlers
│   │   │   ├── schemas/              # zod
│   │   │   ├── types.ts
│   │   │   └── index.ts              # public API barrel
│   │   ├── project/
│   │   ├── issue/
│   │   │   ├── components/
│   │   │   │   ├── IssueCard.tsx
│   │   │   │   ├── IssueCard.test.tsx
│   │   │   │   ├── IssueDetailModal.tsx
│   │   │   │   └── IssueDetailModal.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useIssue.ts
│   │   │   │   └── useIssue.test.ts
│   │   │   ├── api/
│   │   │   ├── schemas/
│   │   │   ├── types.ts              # Issue, IssueStatus, Priority (branded)
│   │   │   └── index.ts
│   │   ├── board/                    # kanban + drag (complex -> own AGENTS.md)
│   │   │   ├── AGENTS.md
│   │   │   ├── components/
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   ├── CardDragOverlay.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useBoardDnd.ts    # pragmatic-dnd wiring
│   │   │   │   └── useBoardDnd.test.ts
│   │   │   ├── logic/                # pure domain (no React)
│   │   │   │   ├── moveCard.ts
│   │   │   │   └── moveCard.test.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── sprint/
│   │   ├── comment/                  # editor
│   │   ├── search/
│   │   └── notification/
│   │
│   ├── shared/                       # cross-feature, no feature imports
│   │   ├── ui/                      # design-system primitives (Button, Modal, ...)
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── lib/                     # utils (cn, formatDate, ...)
│   │   ├── hooks/                   # generic hooks
│   │   ├── types/                   # branded primitives (IssueId, UserId)
│   │   └── config/                  # env parsing (zod)
│   │
│   ├── server/                      # server-only code (never imported by client)
│   │   ├── db/                      # prisma client singleton
│   │   ├── auth/                    # auth config
│   │   └── repositories/            # data access (one per aggregate)
│   │
│   └── generated/                   # gitignored, auto (prisma client, etc.)
│
├── e2e/                            # agent-browser + Lightpanda specs
│   ├── fixtures/
│   ├── board-drag.spec.ts
│   ├── issue-crud.spec.ts
│   └── README.md                   # how to run with Lightpanda CDP
│
├── .opencode/                      # (optional) project skills
│   └── skills/
│       └── (none yet)
│
└── docs/                           # human + agent docs
    ├── architecture.md
    ├── data-model.md
    └── adr/                        # architecture decision records
```

## 4. AGENTS.md (draft template to drop at root)

```md
# AGENTS.md — golki (Jira clone)

## Project

Jira clone. Stack: Next.js 15 (App Router), React 19, TS strict, Tailwind v4, HeroUI v3, Prisma+Postgres, Zustand, TanStack Query, Biome, Vitest, agent-browser+Lightpanda E2E.

## Golden commands (CI == local)

- Install: `bun install`
- Dev: `bun run dev` (http://localhost:3000)
- Typecheck: `bun run typecheck` (`tsc --noEmit`)
- Lint+format: `bun run check` (`biome check --write .`)
- Unit tests: `bun run test` (Vitest)
- E2E: `bun run e2e` (agent-browser + Lightpanda CDP; see e2e/README.md)
- DB: `bun run db:push`, `bun run db:seed`, `bun run db:studio`

## Structure

- `src/app/` routes only (thin). Logic lives in `src/features/*`.
- `src/features/<name>/` owns components, hooks, api, schemas, types, tests. Public API via `index.ts`.
- `src/shared/` cross-feature primitives/utils. Never import a feature from shared.
- `src/server/` server-only (db, auth, repos). Never import into client bundles.
- `src/generated/` auto-generated — DO NOT EDIT.
- `prisma/` schema is source of truth for data model.

## Conventions

- Files kebab-case; components PascalCase; hooks `useX`; tests `*.test.ts(x)` co-located.
- Strict TS. No `any`. Brand IDs (`IssueId`, `UserId`) from `shared/types`.
- Parse external data with Zod at boundaries (API routes, env, DB rows if needed).
- Pure domain logic in `features/*/logic/` (no React) so it's testable.
- Prefer editing existing files; don't create new ones unless needed.
- No narration comments; only "why" comments at non-obvious decisions.

## Do NOT

- Edit `src/generated/`, `prisma/migrations/` (auto), lockfiles, `.next/`.
- Import server code into client components.
- Cross-import between features; go through `shared/` or a feature's `index.ts`.
- Add dependencies without checking existing ones first.
- Skip Biome/tsc before declaring done.

## When stuck

1. Search codebase for existing pattern (grep).
2. Read `docs/` and feature's `AGENTS.md`.
3. Use context7 for live lib docs.
4. Ask with a proposed plan.
```

## 5. E2E with agent-browser + Lightpanda

- Start Lightpanda: `lightpanda serve --host 127.0.0.1 --port 9222` (CDP).
- agent-browser can use Lightpanda as engine: `agent-browser --engine lightpanda open http://localhost:3000` (or connect via CDP).
- Tests in `e2e/*.spec.ts` driven by agent-browser CLI scripts (snapshot -> click/fill -> assert).
- Faster than Playwright+Chrome; use Chrome engine only when Lightpanda lacks a Web API (tracked in e2e/README.md fallbacks).

## 6. Biome config (biome.json) essentials

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignoreUnknown": true },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "organizeImports": { "enabled": true },
  "javascript": {
    "formatter": { "quoteStyle": "single", "trailingCommas": "all", "semicolons": "asNeeded" }
  }
}
```

## 7. Agent-readiness checklist (from agentpatterns)

- [ ] Strict types, branded IDs
- [ ] Co-located tests
- [ ] Small single-purpose files
- [ ] Consistent patterns (one way to do X)
- [ ] Decision comments at unusual choices
- [ ] AGENTS.md + adapters + llms.txt
- [ ] Golden commands match CI
- [ ] Generated code isolated & ignored
- [ ] Per-feature public barrels (index.ts)
- [ ] Domain logic pure & tested
```

## 8. Why this matters for agents
Agents pattern-match; clear structure + types + tests + AGENTS.md = fewer wrong commands, fewer edits to generated files, smaller diffs, less re-explaining. "Legibility beats cleverness."
```
