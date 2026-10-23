# AGENTS.md — golki (Jira clone)

Status: draft scaffold (project not yet initialized). Update when scaffolding.

## Project

Jira clone matching Atlassian design system.
Stack: Next.js 15 (App Router), React 19, TS strict, Tailwind v4, HeroUI v3, Prisma + Postgres, Zustand, TanStack Query, Biome, Vitest, agent-browser + Lightpanda E2E, @atlaskit/pragmatic-drag-and-drop.

## Golden commands (CI == local)

- Install: `bun install`
- Dev: `bun run dev`
- Typecheck: `bun run typecheck` (`tsc --noEmit`)
- Lint+format: `bun run check` (`biome check --write .`)
- Unit tests: `bun run test` (Vitest)
- E2E: `bun run e2e` (agent-browser + Lightpanda CDP; see e2e/README.md)
- DB: `bun run db:push` (no migration files in dev), `bun run db:seed`, `bun run db:studio`

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

- Edit `src/generated/`, lockfiles, `.next/`. (No `prisma/migrations/` in dev — use `db:push`.)
- Import server code into client components.
- Cross-import between features; go through `shared/` or a feature's `index.ts`.
- Add dependencies without checking existing ones first.
- Skip Biome/tsc before declaring done.

## When stuck

1. Search codebase for existing pattern (grep).
2. Read `docs/` and feature's `AGENTS.md`.
3. Use context7 for live lib docs.
4. Ask with a proposed plan.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
