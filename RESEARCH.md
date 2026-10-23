# Jira Clone — UI/UX Research & Stack Recommendation

## 1. Goal

Build a Jira clone matching Atlassian's design system (light/dark, tokens, elevation, drag-and-drop, rich text).

## 2. The Authentic Source — Atlassian Design System (ADS)

- **Docs**: https://atlassian.design | **Components**: https://atlaskit.atlassian.com
- **Packages**: `@atlaskit/*` on npm (Apache-2.0). Key ones: `button`, `modal-dialog`, `dropdown-menu`, `dynamic-table`, `table-tree`, `tabs`, `tag`, `lozenge`, `avatar`, `primitives`, `tokens`, `css-reset`, `motion`, `popper`, `portal`, `pragmatic-drag-and-drop`, `editor-core`.
- **Tokens**: `@atlaskit/tokens` exports `token()` + CSS vars (`--ds-surface-raised`, etc.). Dark mode via `data-color-mode` / `data-theme` attributes.
- **Styling**: Compiled CSS-in-JS (`@compiled/react` + `@compiled/vite-plugin`). Vite integration is **experimental/unsupported** by Atlassian; Parcel/Webpack recommended. Peer deps: React 18 (not 19) for editor; React 19 widens range partially.
- **Drag & drop**: Jira itself uses `@atlaskit/pragmatic-drag-and-drop` (framework-agnostic, uses native HTML5 DnD, ~core 475KB). This is the authentic Jira DnD feel (ghost indicators, FLIP).
- **Rich text**: `@atlaskit/editor-core` (ProseMirror-based) — heavy, React 18 only, but gives Jira's editor.

### Verdict on using Atlaskit directly

- ✅ Pixel-perfect Jira look, tokens, dark mode, a11y, real DnD.
- ❌ React 18 lock-in (editor), Compiled bundler setup (Vite experimental), large bundle, "limited support for external devs", internal feature flags.
- **Recommendation**: Use Atlaskit **tokens + pragmatic-dnd + (optionally) editor** as the authentic core, but build UI chrome with a Tailwind-based library themed to ADS tokens. Avoid importing every Atlaskit component (heavy). Or go all-Atlaskit if pixel parity > DX.

## 3. UI Library Comparison (for the chrome layer)

| Library              | Styling          | A11y base  | Breadth    | AI tooling                  | Fit for Jira clone                                                                    |
| -------------------- | ---------------- | ---------- | ---------- | --------------------------- | ------------------------------------------------------------------------------------- |
| **HeroUI v3**        | Tailwind v4      | React Aria | 72+ comps  | MCP, llms.txt, agent skills | ⭐ Best default — clean SaaS look, dark mode, compound API, AI-native                 |
| **shadcn/ui**        | Tailwind         | Radix      | 59 entries | MCP, llms.txt, skills       | Best for full control; copy-paste, you own code; huge ecosystem (magicui, aceternity) |
| **Chakra UI v3**     | Panda CSS        | Ark UI     | ~59        | MCP, docs                   | Good theming, but style-props verbose; less Jira-like out of box                      |
| **MUI**              | Emotion/Pigment  | MUI impl   | Very broad | Public docs                 | Material look ≠ Jira; heavy; skip unless needed                                       |
| **Mantine**          | CSS modules      | Mantine    | Broad      | docs                        | Solid but distinct look; skip                                                         |
| **Radix Primitives** | unstyled         | Radix      | primitives | —                           | Use under shadcn; not standalone                                                      |
| **daisyUI**          | Tailwind classes | —          | 60+        | —                           | Class-based, no React Aria; skip for a11y-critical app                                |
| **Ant Design**       | CSS-in-JS        | Ant        | Huge       | —                           | Enterprise look, heavy; skip                                                          |

### Recommendation

**HeroUI v3** as primary (batteries-included, Tailwind v4, React Aria, AI-native, dark mode) **OR** **shadcn/ui** if you want to own components and port ADS tokens precisely. Both Tailwind-based → easy to inject Atlassian tokens as CSS vars / Tailwind theme.

For motion: **Motion (Framer Motion)** for React UI (modals, list reorder, AnimatePresence) — declarative, layout animations, smaller bundle. Add **GSAP + ScrollTrigger** only for marketing/landing scroll choreography. Don't use GSAP for app chrome (overkill, heavier).

For drag: **`@atlaskit/pragmatic-drag-and-drop`** (authentic Jira DnD) — framework agnostic, works with React 18/19, native DnD, a11y. Alternative: `@dnd-kit/core` (more React-idiomatic, modular, good a11y) if you want lighter and React-native. Jira uses pragmatic → pick pragmatic for parity.

## 4. Atlassian Design Tokens → Tailwind Mapping (concept)

Port these from `@atlaskit/tokens` into Tailwind v4 `@theme`:
- Colors: `color.background.*`, `color.text.*`, `color.border.*`, accent (blue/purple/green/red/amber), neutral scale N0..N900.
- Elevation: `elevation.surface`, `.raised`, `.sunken`, `.overlay` + `elevation.shadow.raised/overlay`.
- Space: space tokens (0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12…).
- Radius: `radius.small/medium/large/xlarge`, plus `radius.tile` (25%).
- Typography: font family (system stack / Atlassian Sans), sizes xs..xxl, weights, line heights.
- Motion: `@atlaskit/motion` durations/easings (or ADS motion tokens).

Dark mode: toggle `data-color-mode="dark"` + `data-theme="dark:dark light:light"` on `<html>`; tokens resolve via CSS vars.

## 5. State / Data / Backend Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript strict.
- **Styling**: Tailwind CSS v4.
- **UI**: HeroUI v3 (or shadcn) + Lucide icons (or `@atlaskit/icon`).
- **State**: Zustand (board state, filters) + React Query (server state).
- **Forms**: React Hook Form + Zod.
- **DnD**: `@atlaskit/pragmatic-drag-and-drop`.
- **Rich text**: `@atlaskit/editor-core` (if parity needed) else Tiptap.
- **DB**: Postgres + Prisma (or Drizzle) + Auth.js (or Clerk).
- **Realtime**: Supabase Realtime or Soketi/Pusher for live board updates.
- **Testing**: Vitest + RTL, Playwright E2E, Storybook for components.
- **Lint/format**: ESLint + Prettier + `@atlaskit/eslint-plugin-design-system` (token enforcement) + Stylelint.

## 6. Skills to leverage (from installed set)

Design/UI:
- `frontend-design`, `ui-ux-pro-max`, `impeccable`, `make-interfaces-feel-better`, `good-css`, `emil-design-eng`, `apple-design`, `ui-animation`, `animate`, `find-animation-opportunities`, `improve-animations`, `design-review`, `design-consultation`, `design-html`, `web-design-guidelines`.

React/TS/quality:
- `vercel-react-best-practices`, `typescript-best-practices`, `agent-ready-typescript`.

Architecture:
- `architect`, `codebase-architect`, `codebase-design`, `domain-modeling`, `universal-code`, `agent-ready-project`, `agent-ready-codebase`, `orchestration-init`, `agent-rules`, `correct`, `blast-radius`, `deslop`, `no-comments`.

Testing/QA:
- `tdd`, `webapp-testing`, `qa`, `qa-only`, `create-verification-skill`, `maintain-verification-skill`.

Research/docs:
- `research`, `context7`, `how`, `why`, `teach`, `technical-writing`, `document-generate`.

Security/perf:
- `cso`, `performance-optimization`, `benchmark-checklist`.

Ops:
- `productionize`, `continual-learning`, `reflect`, `interrogate`.

Tip: run `npx heroui-cli agents-md` (HeroUI) to install component skills for Cursor/Claude/OpenCode. Use `context7` skill to fetch live docs for Atlaskit/Next.js/Prisma when coding.

## 7. Risks / Watch-outs

- Atlaskit editor = React 18 only; pin React 18 if using it, or use Tiptap.
- Compiled CSS bundler setup is non-trivial on Vite; prefer Next.js (Webpack/Turbopack) or Parcel.
- Atlaskit packages are heavy; tree-shake and import subpaths (`@atlaskit/button/button`).
- Feature flags (`platform-dst-*`) gate visual refreshes; test both.
- Pragmatic DnD uses native HTML5 DnD → keyboard a11y needs the `@atlaskit/pragmatic-drag-and-drop` accessible patterns / `@dnd-kit` alternative if keyboard DnD critical.

## 8. Suggested First Steps

1. Scaffold Next.js 15 + TS + Tailwind v4 + HeroUI (or shadcn).
2. Install `@atlaskit/tokens`, `@atlaskit/css-reset`, `@atlaskit/pragmatic-drag-and-drop`.
3. Create `tokens.css` mapping ADS tokens → Tailwind theme; add dark mode toggle.
4. Build primitives: Button, Avatar, Lozenge, Tag, Modal, Dropdown, Tabs.
5. Build Kanban board with pragmatic-dnd + virtualization.
6. Add issue detail modal, comments (editor), filters, search.
7. Set up Prisma schema (User, Project, Issue, Sprint, Comment, Label) + Auth.
8. E2E tests (Playwright) + Storybook.

## 9. Reference Jira clones

- oldboyxx/jira_clone (React + Node/TS, 10.9k ⭐) — architecture reference.
- sebastianfdz/jira_clone (Next 13 + Radix + Tailwind + Prisma + Clerk + RQ) — closest modern stack.
- daniserrano7/jira-clone (Remix + Radix + Tailwind + SQLite).
- AnshulSinsinwar/Kanban-Board (dnd-kit + Zustand + virtualization) — DnD reference.
- Georgegriff/react-dnd-kit-tailwind-shadcn-ui — accessible kanban reference.
