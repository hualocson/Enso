# Image Grid Skeleton Loading — Design

**Date:** 2026-08-09
**Status:** Approved

## Context

The `ImageGrid` component (`client/src/components/home/ImageGrid.tsx`) shows a single
centered spinner (`<Loader/>`) while the items list is being fetched from the API
(`useItems()` → `isPending`). Once loaded, it renders a masonry-style grid of `Card`s
using CSS columns.

The goal is to replace the spinner with skeleton placeholder cards that mimic the real
grid layout while the initial fetch is pending.

## Scope

- **In scope:** Skeleton placeholder grid shown during the initial `isPending` state of
  the items query.
- **Out of scope:** Per-image lazy-load skeletons (individual `<img>` loading after the
  list arrives). Error handling, empty state, and the real grid rendering are unchanged.

## Design Decisions (from brainstorming)

| Decision | Choice |
|----------|--------|
| Coverage | Initial gallery fetch only |
| Layout | Masonry mimic — varied placeholder heights |
| Animation | Tailwind `animate-pulse` (gentle opacity pulse) |
| Card count | 9 placeholders |
| Implementation | Dedicated `ImageGridSkeleton` component |

## Components

### New: `client/src/components/home/ImageGridSkeleton.tsx`

- Default-export arrow function component (project convention).
- Renders **9 placeholder cells** inside a wrapper using the *same* grid classes as the
  real grid:
  `columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]`
- Each cell is a `break-inside-avoid` container holding a placeholder block styled
  `rounded-sm bg-surface-secondary animate-pulse`.
- Varied heights come from a cycled height array (e.g. `[300, 420, 260, 360, 280, 460]`
  in px) indexed by position, so the columns do not look uniform.
- Accessibility: `role="status"` with `aria-label="Loading images"`.
- No barrel export is added — `ImageGrid` imports it directly, matching how `HeroSection`
  and `ImageGrid` are imported from `../components/home/`.

### Modified: `client/src/components/home/ImageGrid.tsx`

- Replace the `isPending` branch:
  - Before: `<div className="flex justify-center items-center"><Loader/></div>`
  - After: `<ImageGridSkeleton/>`
- Remove the now-unused `Loader` import from `../../components/`.
- The real grid branch (masonry columns + `RenderCards`) is untouched.

## Data Flow & Error Handling

- Skeleton shows only while `isPending` is `true`.
- On error, `isPending` becomes `false` and the existing `toast.error(...)` effect +
  grid fallback behavior run exactly as today. No changes.
- No new data fetching or state.

## Verification

- No test framework exists in the repo.
- `npm run build` (typecheck) must pass.
- Manual: reload the page with throttled network; confirm the 9 pulsing placeholder cards
  render in the masonry layout, then swap to real cards once data arrives.
