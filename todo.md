# P3 Implementation Tasks

## Files to create/edit (from brief scope)

- [ ] Create `src/shared/ui/WorkspaceSwitcher.tsx` - Workspace switcher component
- [ ] Edit `src/app/(workspace)/layout.tsx` - Add workspace switcher to header
- [ ] Edit `src/app/(workspace)/workspaces/page.tsx` - Add member invite by email
- [ ] Edit `src/app/api/workspaces/route.ts` - Add member invite endpoint
- [ ] Edit `src/app/api/projects/route.ts` - Add project type selection (kanban/scrum)
- [ ] Create `src/app/api/projects/[id]/route.ts` - Add project edit (key, name, type, lead)

## Acceptance criteria verification

- [ ] Header shows current workspace with a switcher
- [ ] Member invite by email works at basic level
- [ ] Project creation chooses kanban or scrum
- [ ] Project edit for key, name, type, and lead works
- [ ] `bun run check`, `bun run typecheck`, `bun run test` pass
