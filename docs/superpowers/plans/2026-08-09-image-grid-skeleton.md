# Image Grid Skeleton Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centered spinner in the image gallery with a masonry-style skeleton grid while the items list is being fetched.

**Architecture:** A new `ImageGridSkeleton` component renders 9 pulsing placeholder blocks inside the same CSS-columns wrapper classes as the real grid. `ImageGrid` swaps the `isPending` branch from `<Loader/>` to `<ImageGridSkeleton/>`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, Vite.

## Global Constraints

- Follow project conventions from `client/AGENTS.md`: arrow-function components, `export default`, 4-space indentation, PascalCase components, no code comments, imports without extensions.
- Reuse the existing grid classes verbatim: `columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]`.
- Use Tailwind color `bg-surface-secondary` and Tailwind's built-in `animate-pulse`.
- No test framework exists in this repo. Verification is `npx tsc --noEmit` and `npm run build` in `client/`, plus manual browser check.
- Spec reference: `docs/superpowers/specs/2026-08-09-image-grid-skeleton-design.md`

---

### Task 1: Create the `ImageGridSkeleton` component

**Files:**
- Create: `client/src/components/home/ImageGridSkeleton.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `ImageGridSkeleton` — default-exported component with no props.

- [ ] **Step 1: Create the component file**

Create `client/src/components/home/ImageGridSkeleton.tsx` with:

```tsx
const SKELETON_HEIGHTS = [300, 420, 260, 360, 280, 460]
const SKELETON_COUNT = 9

const ImageGridSkeleton = () => {
    return (
        <div
            role="status"
            aria-label="Loading images"
            className="columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]"
        >
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div key={index} className="break-inside-avoid">
                    <div
                        className="rounded-sm bg-surface-secondary animate-pulse"
                        style={{ height: SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length] }}
                    />
                </div>
            ))}
        </div>
    )
}

export default ImageGridSkeleton
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit` (in `client/`)
Expected: exit 0, no output.

- [ ] **Step 3: Build**

Run: `npm run build` (in `client/`)
Expected: Vite build succeeds, outputs to `dist/`.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ImageGridSkeleton.tsx
git commit -m "feat: add image grid skeleton component"
```

---

### Task 2: Render the skeleton in `ImageGrid`

**Files:**
- Modify: `client/src/components/home/ImageGrid.tsx`

**Interfaces:**
- Consumes: `ImageGridSkeleton` (default export from `../components/home/ImageGridSkeleton` — same directory).
- Produces: modified `ImageGrid` that shows the skeleton grid during `isPending`.

- [ ] **Step 1: Update imports and pending branch**

In `client/src/components/home/ImageGrid.tsx`:

1. Add the import for `ImageGridSkeleton` after the existing imports:

```tsx
import ImageGridSkeleton from './ImageGridSkeleton'
```

2. Remove `Loader` from the `../../components/` import so it becomes:

```tsx
import { Card } from '../../components/'
```

3. Replace the `isPending` branch (currently lines 56-59) with:

```tsx
            {isPending ? (
                <ImageGridSkeleton />
            ) : (
```

The full return block should now read:

```tsx
    return (
        <div className="md:mt-80 mt-40" id="image-grid">
            {isPending ? (
                <ImageGridSkeleton />
            ) : (
                <div
                    className='columns-1 sm:columns-2 md:columns-3 md:gap-32 gap-12 space-y-[120px] md:space-y-[180px]'
                >
                    <RenderCards
                        data={data ?? null}
                        title="No Items Yet"
                    />
                </div>
            )}
        </div>
    )
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit` (in `client/`)
Expected: exit 0, no output. `Loader` is no longer imported or referenced anywhere in `ImageGrid.tsx`.

- [ ] **Step 3: Build**

Run: `npm run build` (in `client/`)
Expected: Vite build succeeds, outputs to `dist/`.

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open the site, and throttle the network to Slow 3G in DevTools. Reload.
Expected: 9 pulsing placeholder cards appear in the masonry layout (varied heights), then swap to real cards when data loads. No spinner anywhere in the gallery.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ImageGrid.tsx
git commit -m "feat: show skeleton grid while images load"
```

---
