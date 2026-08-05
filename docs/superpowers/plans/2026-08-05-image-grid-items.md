# Image Grid: Fetch Items Instead of Posts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the home gallery from the legacy posts API to `GET /api/v1/items`, and update `Card` to display the item `title` (renaming `name`/`photo` props to `title`/`imageUrl`).

**Architecture:** `Card` mirrors the server `Item` document shape (`title`, `imageUrl`), hiding its hover label when `title` is absent. `ImageGrid` fetches `/api/v1/items?limit=100`, drops the client-side `.reverse()` (server already sorts newest-first), and renders `Card` via prop spread.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, iconoir-react, sonner.

## Global Constraints

- Server API: `GET /api/v1/items?page=1&limit=100` returns `{ data: Item[], pagination: {...} }`. The client `api.get` helper unwraps `json.data`, so the array arrives directly. Use the `api` util — do not hardcode a URL.
- Item document shape: `{ id: string, type: 'upload' | 'generated', title?: string, prompt?: string, imageUrl: string, width: number, height: number, createdAt: string, updatedAt: string }`.
- Server sorts by `createdAt` descending (`server/repositories/item.repository.ts`). Do **not** call `.reverse()` in the client.
- `title` is optional (uploads may omit it). When empty, hide the title `<p>` label but keep the download button rendered.
- Client conventions: 4-space indentation, no code comments, `cn` util for className logic, `sonner` `toast`, `iconoir-react` icons.
- No test framework exists. Verify with `npx tsc --noEmit` and `npm run build`, run from `client/`.
- Git repo root is `/home/locson/workspaces/personal/AI-image-generator` (one level above `client/`). Run `git add`/`git commit` from the repo root with `client/...` paths.

---

### Task 1: Update Card to `title`/`imageUrl` and switch ImageGrid to the items API

**Files:**
- Modify: `client/src/components/Card.tsx`
- Modify: `client/src/components/home/ImageGrid.tsx`

**Interfaces:**
- Consumes: existing `api.get<T>(path)`, `getErrorMessage`, `downloadImage(id, url)`, `Loader`, `toast`.
- Produces: `CardProps = { id: string, title?: string, prompt?: string, imageUrl: string, tilt?: string }`; `Item` interface in `ImageGrid.tsx`.

These two files change together — `Card`'s prop rename breaks the build until `ImageGrid` passes the new props, so they land in one task/commit.

- [ ] **Step 1: Rewrite `client/src/components/Card.tsx`**

Replace the entire file with:

```tsx
import { Download } from 'iconoir-react'
import { cn, downloadImage } from '../utils'
import { CSSProperties } from 'react'

interface CardProps {
  id: string
  title?: string
  prompt?: string
  imageUrl: string
  tilt?: string
}

const Card = ({ id, title, prompt, imageUrl, tilt = "0deg" }: CardProps) => {
  return (
    <article className={cn("rounded-sm overflow-hidden relative isolate group",
      "transform scale-100 rotate-[var(--tilt,0deg)] hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
    )}
      style={{
        "--tilt": tilt
      } as CSSProperties}
    >
      <img
        className="w-full rounded-[inherit] h-full brightness-95 group-hover:brightness-75 transition-all duration-500 group-hover:scale-105 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        src={imageUrl}
        alt={prompt ?? title ?? 'Image'}
      />
      <span className='absolute inset-0 ring-1 rounded-[inherit] ring-black/10 z-10 ring-inset' />
      <span className='absolute inset-0 z-10 bg-gradient-to-5 from-black/80 via-black/30 to-transparent' />
      <div className="flex flex-col absolute bottom-0 left-0 right-0 p-4 rounded-md z-20 opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
        <div className="flex justify-between items-center gap-2">
          {title && (
            <p className="text-surface text-sm drop-shadow-xl font-semibold">{title}</p>
          )}
          <button
            type="button"
            onClick={() => downloadImage(id, imageUrl)}
            className="outline-none bg-transparent border-none text-white"
          >
            <Download className="size-5" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default Card
```

- [ ] **Step 2: Rewrite `client/src/components/home/ImageGrid.tsx`**

Replace the entire file with:

```tsx
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, Loader } from '../../components/'
import { getErrorMessage, api } from '../../utils/'

interface Item {
  id: string
  type: 'upload' | 'generated'
  title?: string
  prompt?: string
  imageUrl: string
  width: number
  height: number
  createdAt: string
}

interface RenderCardsProps {
  data: Item[] | null
  title: string
}

const getDeg = (index: number): string => {
  switch (index % 8) {
    case 0:
      return "-2.2deg";
    case 1:
      return "1.8deg";
    case 2:
      return "-1.1deg";
    case 3:
      return "2.5deg";
    case 4:
      return "-0.7deg";
    case 5:
      return "1.3deg";
    case 6:
      return "-1.9deg";
    case 7:
      return "0.9deg";
    default:
      return "0deg";
  }
};

const RenderCards = ({ data, title }: RenderCardsProps) => {
  if (data && data.length > 0) {
    return data.map((item, index) => <Card key={item.id} {...item} tilt={getDeg(index)} />)
  }

  return (
    <h2 className="">
      {title}
    </h2>
  )
}
const ImageGrid = () => {


  const [loading, setLoading] = useState(false)
  const [allItems, setAllItems] = useState<Item[] | null>(null)

  const fetchItems = async () => {
    setLoading(true)

    try {
      const data = await api.get<Item[]>('/api/v1/items?limit=100')
      setAllItems(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])
  return (
    <div className="mt-80">
      {loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div
          className='columns-1 sm:columns-2 md:columns-3 gap-28 space-y-[140px]'
        >
          <RenderCards
            data={allItems}
            title="No Items Yet"
          />
        </div>
      )}
    </div>
  )
}

export default ImageGrid
```

- [ ] **Step 3: Verify types and build**

Run (from `client/`):
```bash
npx tsc --noEmit
npm run build
```
Expected: no type errors; Vite build completes with `✓ built in ...`.

- [ ] **Step 4: Manual smoke test**

Run `npm run dev` (from `client/`) and `npm start` (from `server/`, port 8080). Navigate to `http://localhost:5173/`. Expected:
- Grid loads images from `/api/v1/items` (newest first) — including previously uploaded files and generated images.
- Hovering a card with a `title` shows the title and the download button; hovering a card without a title shows only the download button.
- Download button downloads the item's `imageUrl`.

- [ ] **Step 5: Commit**

Run from the repo root:
```bash
git add client/src/components/Card.tsx client/src/components/home/ImageGrid.tsx
git commit -m "feat: display items API in home grid and use title on cards"
```
