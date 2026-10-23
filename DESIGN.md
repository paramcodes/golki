# DESIGN.md — Atlassian/Jira Design System (for golki)

Source: atlassian.design (ADS) + Atlaskit. Pixel parity target for Jira clone.

## 1. Philosophy

- Neutral-dominant, restrained saturation. Color carries meaning; surfaces calm.
- 8px rhythm. Four-plane elevation model. Depth earned, not decorative.
- Token-first: never raw hex in app code; use tokens (or mapped Tailwind vars).
- Light + dark via `data-color-mode`/`data-theme`.

## 2. Color

### Brand / primary

| Token    | Hex     | Usage                         |
| -------- | ------- | ----------------------------- |
| Blue 700 | #1868DB | Primary actions, links, focus |
| Blue 800 | #0055CC | Hover                         |
| Blue 900 | #09326C | Pressed/active                |
| Blue 400 | #4C9AFF | Dark-mode primary             |

### Neutrals (light)

| Token        | Hex         | Usage                 |
| ------------ | ----------- | --------------------- |
| Neutral 0    | #FFFFFF     | Surface bg            |
| Neutral 100  | #F7F8F9     | Secondary bg (sunken) |
| Neutral 200  | #DCDFE4     | Borders/dividers      |
| Neutral 300  | #B3B9C4     | (alpha)               |
| Neutral 600  | #44546F     | Secondary text        |
| Neutral 800  | #172B4D     | Primary text          |
| Neutral 900  | #091E42     | (bolder)              |
| Neutral 1000 | #000000-ish | inverse text on bold  |

### Neutrals (dark)

| Token            | Hex                     |
| ---------------- | ----------------------- |
| DarkNeutral 0    | #000000? (surface base) |
| DarkNeutral 100  | #0D0F12                 |
| DarkNeutral 200  | #161A1D                 |
| DarkNeutral 250  | #1D2125                 |
| DarkNeutral 300  | #22272B                 |
| DarkNeutral 1000 | #FFFFFF (text)          |

(Use @atlaskit/tokens CSS vars; values resolve per theme — prefer tokens over hardcoded.)

### Status

| Token      | Hex     | Usage             |
| ---------- | ------- | ----------------- |
| Green 700  | #22A06B | Success           |
| Yellow 600 | #B38600 | Warning           |
| Red 700    | #CA3521 | Error/destructive |
| Purple 700 | #6E5DC6 | Discovery/new     |
| Teal 600   | #1D7F8C | Info              |
| Orange     | #BD5B00 | (caution)         |
| Magenta    | #AE4787 | (accent)          |

### Semantic tokens (use these in code)

- `color.text`, `color.text.subtle`, `color.text.subtlest`, `color.text.inverse`, `color.text.disabled`
- `color.text.accent.{blue,green,red,...}.bolder`
- `color.background.neutral`, `.hovered`, `.pressed`, `.subtle`, `.bold`
- `color.background.accent.{color}.subtlest/subtler/subtle/bolder` + states
- `color.background.input`, `.disabled`, `.selected`, `.information`, `.success`, `.warning`, `.danger`, `.discovery`
- `color.border`, `color.border.input`, `color.border.selected`, `color.border.focused`
- `color.icon`, `color.icon.subtle`, `color.icon.inverse`
- `color.link`, `color.link.pressed`, `color.link.visited`
- `elevation.surface`, `.raised`, `.sunken`, `.overlay`, `.container`
- `elevation.shadow.raised`, `.overlay`, `.overflow`
- `color.blanket` (modal overlay)

### Accent ramps (for tags/lozenges)

Blue/Red/Orange/Yellow/Green/Teal/Magenta/Purple/Gray/Lime — each 100..1000 with alpha variants.

## 3. Typography

- Family: Atlassian Sans (proprietary) → fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`. Code: Atlassian Mono → `Menlo, Monaco, Consolas, monospace`.
- Base size 14px (0.875rem) for components; 16px for long-form.
- Weights: regular 400, medium 500, semibold 600 (caution: fallbacks lack 600→bold), bold 653 (unique).
- Scale (rem, base 16px):
  | Role            | size          | line-height   | weight              |
  | --------------- | ------------- | ------------- | ------------------- |
  | heading.xxlarge | 2rem/32px     | 2.25rem/36px  | bold                |
  | heading.xlarge  | 1.75rem/28px  | 2rem/32px     | bold                |
  | heading.large   | 1.5rem/24px   | 2rem/32px     | bold                |
  | heading.medium  | 1.25rem/20px  | 1.5rem/24px   | bold                |
  | heading.small   | 1rem/16px     | 1.25rem/20px  | bold                |
  | heading.xsmall  | 0.875rem/14px | 1.125rem/18px | bold                |
  | heading.xxsmall | 0.75rem/12px  | 1rem/16px     | bold                |
  | body.large      | 1rem/16px     | 1.5rem/24px   | regular/medium/bold |
  | body (default)  | 0.875rem/14px | 1.25rem/20px  | regular/medium/bold |
  | body.small      | 0.75rem/12px  | 1rem/16px     | regular/medium/bold |
- Rules: min 12px; 2-4 size steps between heading levels; medium weight for text beside icons; bold sparingly.

## 4. Spacing (8px base)

Tokens: `space.0`=0, `.025`=2px, `.050`=4px, `.075`=6px, `.100`=8px, `.150`=12px, `.200`=16px, `.250`=20px, `.300`=24px, `.400`=32px, `.500`=40px, `.600`=48px, `.800`=64px, `.1000`=80px. Negative mirror. All padding/margin/gap on token steps — no off-grid 13px.

## 5. Radius (t-shirt)

- `radius.xsmall` 2px, `small` 3px, `medium` 4px, `large` 6px (or 8px), `xlarge` 12px, `xxlarge` 16px, `full` 9999px.
- `radius.tile` 25% (tile system only).
- Use per component class; don't invent.

## 6. Elevation (4 planes)

- Plane 0: sunken surface (column bg) `elevation.surface.sunken`.
- Plane 1: default surface `elevation.surface`.
- Plane 2: raised card (issue card) `elevation.surface.raised` + `elevation.shadow.raised`.
- Plane 3: overlay (modal/dropdown/popover) `elevation.surface.overlay` + `elevation.shadow.overlay`.
- Use elevation to explain object (card raised because it's movable).

## 7. Layout (Jira app shell)

- Top nav: simplified (search + create + avatar). ~48-56px height. Product/global nav in left sidebar.
- Left sidebar: collapsible/resizable, customizable, sections. Expanded shows labels; collapsed icons only. Shortcut Ctrl+[.
- Project view: horizontal tabs (Board, Backlog, Timeline, Calendar, List, Reports, ...). Reorderable/hideable by admin.
- Board: horizontal scroll columns, each column sunken surface, cards raised. Column header with count + "..." menu.
- Issue detail: modal dialog (overlay) with left content (title, description, comments) + right sidebar (fields: status, assignee, reporter, priority, labels, sprint, estimate, dates).
- Responsive: collapse sidebar on small screens; board horizontal scroll.

## 8. Components

### Button

- Appearances: primary (brand bold), default (neutral), subtle, link, danger, warning, discovery, subtile.
- Sizes: small/medium/large/xlarge; compact icon.
- States: default/hovered/pressed/disabled/focused/loading.
- Icon + text; icon-only circular/square.
- Radius medium; medium weight text.

### Lozenge (status pill)

- Subtle (tinted bg) or bold (solid) per status. Rounded full/small.
- Used for status, priority-ish, read-only labels.

### Tag

- Removable, color-coded (accent colors), subtle/bold. Group with tag-group.

### Badge

- Numeric counts (notifications, counts).

### Avatar / Avatar group

- Sizes xs..xxl; presence (online/offline/busy); stack group with +N overflow.

### Modal dialog

- Overlay blanket; centered; sizes small/medium/large/xlarge/full; header (title + close), body, footer (actions right). Focus trap, ESC close.

### Dropdown menu

- Trigger + menu (items, groups, dividers, checkbox/radio items). Keyboard nav.

### Tabs

- Horizontal; active underline (brand). Variants: default, pill.

### Dynamic table / Table tree

- Sortable, paginated, selectable rows, expandable.

### Inline edit

- Click-to-edit text in place.

### Card (issue card on board)

- Raised surface; summary (bold-ish), key (e.g. PROJ-123) subtle, priority icon, type icon, assignee avatar, labels (lozenges/tags), estimate, due date, comment/attachment counts, "days in column" indicator.
- Drag handle implicit (whole card draggable); hover shows actions (open, assign, ...).
- Selected state: neutral selected tokens (not blue) when flag on.

### Empty state

- Illustration + heading + description + CTA.

### Flag / Banner / Section message

- Tinted bg + icon + title + body; body copy neutral text (not tinted).

### Spinner / Skeleton / Progress bar.

### Tooltip / Popover / Drawer.

### Navigation: breadcrumbs, pagination.

## 9. Motion

- Use `@atlaskit/motion` (or ADS motion tokens). Durations: short 100-150ms (hover), medium 200-250ms (modal), long 300-400ms (page). Easings: standard ease, decelerate (enter), accelerate (exit).
- Drag: card lift (scale 1.02, shadow raised), ghost placeholder (dashed border, subtle bg), FLIP reorder, drop animation.
- Respect `prefers-reduced-motion`.

## 10. Dark mode

- Toggle `data-color-mode="dark"` + `data-theme="dark:dark light:light ..."` on `<html>`.
- Tokens resolve via CSS vars; saturated colors mirror (700 light ↔ 400 dark; 100 light ↔ 1000 dark).
- Don't hardcode; always token.

## 11. Do / Don't

Do:
- Blue 700 for primary interactive.
- 4.5:1 contrast for text.
- 8px grid spacing.
- Token references in prose/recipes; literal hex only in CSS output.
- Neutral text on tinted panels (not tinted paragraphs).
  Don't:
- Arbitrary hex without token mapping.
- Off-grid spacing (13px).
- Custom button styles.
- Color alone for meaning (add icon/text).
- Create new radius values.

## 12. Accessibility

- Keyboard nav for all interactive; focus visible (border.focused).
- Screen reader labels; aria for drag (pragmatic-dnd a11y patterns).
- Reduced motion support.

## 13. Implementation notes for golki

- Use @atlaskit/tokens for CSS vars (or port to Tailwind @theme). Prefer tokens directly if using Atlaskit components; else map.
- Icons: @atlaskit/icon (or Lucide as fallback; ADS icon set preferred for parity).
- Drag: @atlaskit/pragmatic-drag-and-drop.
- Editor: Tiptap (or @atlaskit/editor-core if React 18 pinned).
- Font: Atlassian Sans unavailable publicly → use system stack fallback; document.
- Dark mode toggle persists to localStorage + system preference.
