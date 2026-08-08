# TanStack Query Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hand-rolled `useState`/`useEffect` fetching in the client with TanStack Query v5 via a typed `src/api/` layer and four thin hooks, providing caching, background sync, and automatic invalidation after mutations.

**Architecture:** Install `@tanstack/react-query@^5.101.4`. Create pure (React-free) `src/api/` modules — `items.ts` (Item type + key factory + `queryOptions`) and `generate.ts` (generate/share mutation fns) — with a barrel `index.ts`. Create four hooks in `src/hooks/` (`useItems`, `useUploadItem`, `useGenerateImage`, `useShareAiImage`) that wrap `useQuery`/`useMutation`, own all toasts + invalidation + navigation, and delegate to the existing `src/utils/api.ts` fetch layer (untouched). Wire a module-level `QueryClient` (`staleTime: 60_000`, `retry: 1`) into `QueryClientProvider` in `main.tsx`. Refactor `ImageGrid`, `Upload`, and `GenerateImage` pages to consume the hooks, dropping local loading state and hand-rolled `api` calls.

**Tech Stack:** React 18, Vite 8, TypeScript 5 (strict), Tailwind CSS 3, `@tanstack/react-query@^5.101.4`, `sonner`, `react-router-dom` 6.

**Spec:** `docs/superpowers/specs/2026-08-08-tanstack-query-design.md`

## Global Constraints

- No test framework exists (spec decision); the verification gate for every task is `npx tsc --noEmit` + `npm run build`.
- IMPORTANT: `npm run build` runs `vite build` (esbuild) which does **NOT** typecheck — run `npx tsc --noEmit` separately.
- Components as arrow functions with `export default`; props typed with `interface` in same file.
- Hooks as `export function useX()` declarations (matches existing `useLenis.ts`).
- Barrel exports: every directory has `index.ts` with named re-exports.
- Imports: no extension for `.tsx`/`.ts`; relative imports from barrel files.
- Indentation: 4 spaces.
- `tsconfig` has `noUnusedLocals` + `noUnusedParameters` — remove imports/variables your refactor makes unused.
- Existing `src/utils/api.ts` (the `api` fetch wrapper) stays untouched; all new code delegates to it.
- `src/utils/index.ts` must NOT re-export anything from `src/api/` (avoid circular imports; `src/api/` imports from `src/utils/`, never the reverse).
- All success/error toasts, `invalidateQueries`, and `navigate` live INSIDE the hooks. Pages call `mutate(...)` with no `try/catch` and no `setLoading`.
- Behavioral change from spec: share now shows a success toast (`Image shared successfully`) — was silent in the original page. Spec's hook table mandates `onSuccess → toast + invalidate + navigate`.

---

### Task 1: Install @tanstack/react-query

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the dependency**

```bash
npm install @tanstack/react-query@^5.101.4
```

- [ ] **Step 2: Verify installation**

```bash
npm list @tanstack/react-query
```

Expected: `@tanstack/react-query@5.x.x` listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @tanstack/react-query dependency"
```

---

### Task 2: Create the `src/api/` layer

**Files:**
- Create: `src/api/items.ts`
- Create: `src/api/generate.ts`
- Create: `src/api/index.ts`

**Interfaces:**
- Produces: `Item` type, `itemKeys` factory, `itemsOptions` (via `queryOptions`); `generateImage` (returns data-URI string), `ShareAiImageInput` type, `shareAiImage`.
- Consumes: `api` from `src/utils/index.ts`, `queryOptions` from `@tanstack/react-query`.

- [ ] **Step 1: Create `src/api/items.ts`**

```typescript
import { queryOptions } from '@tanstack/react-query'
import { api } from '../utils'

export interface Item {
    id: string
    type: 'upload' | 'generated'
    title?: string
    prompt?: string
    imageUrl: string
    width: number
    height: number
    createdAt: string
}

export const itemKeys = {
    all: ['items'] as const,
    list: () => [...itemKeys.all, 'list'] as const,
}

export const itemsOptions = queryOptions({
    queryKey: itemKeys.list(),
    queryFn: () => api.get<Item[]>('/api/v1/items?limit=100'),
})
```

Note: `itemKeys.all` is `['items']`; `itemKeys.list()` is `['items', 'list']`. `invalidateQueries({ queryKey: itemKeys.all })` prefix-matches the list key (TanStack v5 partial matching default).

- [ ] **Step 2: Create `src/api/generate.ts`**

```typescript
import { api } from '../utils'

export async function generateImage(
    prompt: string,
    size?: string,
): Promise<string> {
    const body: Record<string, string> = { prompt }
    if (size) body.size = size
    const data = await api.post<{ photo: string }>('/api/v1/dalle', body)
    return `data:image/jpeg;base64,${data.photo}`
}

export interface ShareAiImageInput {
    title: string
    prompt: string
    photo: string
}

export function shareAiImage(form: ShareAiImageInput): Promise<void> {
    return api.post<void>('/api/v1/items/upload-ai-image', form)
}
```

- [ ] **Step 3: Create `src/api/index.ts`**

```typescript
export { itemKeys, itemsOptions } from './items'
export type { Item } from './items'
export { generateImage, shareAiImage } from './generate'
export type { ShareAiImageInput } from './generate'
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: exits with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/api
git commit -m "feat: add typed api layer for items and image generation"
```

---

### Task 3: Create the four query/mutation hooks

**Files:**
- Create: `src/hooks/useItems.ts`
- Create: `src/hooks/useUploadItem.ts`
- Create: `src/hooks/useGenerateImage.ts`
- Create: `src/hooks/useShareAiImage.ts`
- Modify: `src/hooks/index.ts`

**Interfaces:**
- Produces: `useItems()` → `{ data, isPending, error }`; `useUploadItem()` → `{ mutate, isPending }` (input `{ file, title }`); `useGenerateImage()` → `{ mutate, isPending }` (input `{ prompt, size? }`, resolves `string`); `useShareAiImage()` → `{ mutate, isPending }` (input `ShareAiImageInput`).
- Consumes: `useQuery`/`useMutation`/`useQueryClient` from `@tanstack/react-query`, `itemKeys`/`generateImage`/`shareAiImage` from `src/api`, `api` + `getErrorMessage` from `src/utils`, `toast` from `sonner`, `useNavigate` from `react-router-dom`.

- [ ] **Step 1: Create `src/hooks/useItems.ts`**

```typescript
import { useQuery } from '@tanstack/react-query'
import { itemsOptions } from '../api'

export function useItems() {
    return useQuery(itemsOptions)
}
```

- [ ] **Step 2: Create `src/hooks/useUploadItem.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { itemKeys } from '../api'
import { api, getErrorMessage } from '../utils'

interface UploadItemInput {
    file: File
    title: string
}

export function useUploadItem() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async ({ file, title }: UploadItemInput) => {
            const formData = new FormData()
            formData.append('image', file)
            if (title.trim()) formData.append('title', title.trim())
            await api.postForm('/api/v1/items/upload-file', formData)
        },
        onSuccess: () => {
            toast.success('Image uploaded successfully')
            queryClient.invalidateQueries({ queryKey: itemKeys.all })
            navigate('/')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
```

- [ ] **Step 3: Create `src/hooks/useGenerateImage.ts`**

```typescript
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generateImage } from '../api'
import { getErrorMessage } from '../utils'

interface GenerateImageInput {
    prompt: string
    size?: string
}

export function useGenerateImage() {
    return useMutation({
        mutationFn: ({ prompt, size }: GenerateImageInput) =>
            generateImage(prompt, size),
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
```

- [ ] **Step 4: Create `src/hooks/useShareAiImage.ts`**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { itemKeys, shareAiImage } from '../api'
import { getErrorMessage } from '../utils'

export function useShareAiImage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: shareAiImage,
        onSuccess: () => {
            toast.success('Image shared successfully')
            queryClient.invalidateQueries({ queryKey: itemKeys.all })
            navigate('/')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
```

Note: `mutationFn: shareAiImage` infers `variables` as `ShareAiImageInput` from the function signature.

- [ ] **Step 5: Update `src/hooks/index.ts`**

```typescript
export { useLenis } from './useLenis'
export { useItems } from './useItems'
export { useUploadItem } from './useUploadItem'
export { useGenerateImage } from './useGenerateImage'
export { useShareAiImage } from './useShareAiImage'
```

- [ ] **Step 6: Typecheck**

```bash
npx tsc --noEmit
```

Expected: exits with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks
git commit -m "feat: add tanstack query hooks for items, upload, generate, share"
```

---

### Task 4: Wire QueryClientProvider in main.tsx

**Files:**
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: app wrapped in `QueryClientProvider` with a module-level `QueryClient` (`staleTime: 60_000`, `retry: 1`).

- [ ] **Step 1: Replace `src/main.tsx` contents**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster
                position="bottom-right"
                richColors
                closeButton
            />
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
)
```

`QueryClient` is created once at module scope (outside the component), per spec. `<Toaster>` remains a sibling of `<App>` inside the provider.

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: typecheck clean; Vite build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: add QueryClientProvider with module-level query client"
```

---

### Task 5: Refactor ImageGrid to useItems

**Files:**
- Modify: `src/components/home/ImageGrid.tsx`

**Interfaces:**
- Consumes: `useItems()` from `src/hooks`, `Item` type from `src/api`.
- Behavior: `isPending` drives the existing Loader; `data` feeds `RenderCards`; a `useEffect` toasts once when `error` changes (matches today's toast-on-fetch-failure UX).

- [ ] **Step 1: Replace `src/components/home/ImageGrid.tsx`**

Remove the local `Item` interface, `useState`, `loading`, `allItems`, `fetchItems`, and the `api` import. `RenderCards` and `getDeg` stay byte-for-byte identical. Note `data` from `useQuery` is `Item[] | undefined`, so pass `data ?? null` to `RenderCards` (its prop is `Item[] | null`).

```tsx
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Card, Loader } from '../../components/'
import { getErrorMessage } from '../../utils/'
import { useItems } from '../../hooks/'
import type { Item } from '../../api/'

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
    const { data, isPending, error } = useItems()

    useEffect(() => {
        if (error) toast.error(getErrorMessage(error))
    }, [error])

    return (
        <div className="md:mt-80 mt-40" id="image-grid">
            {isPending ? (
                <div className="flex justify-center items-center">
                    <Loader />
                </div>
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
}

export default ImageGrid
```

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: no errors. If you see an unused-import error, an import was left behind — remove it.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ImageGrid.tsx
git commit -m "refactor: use useItems hook in ImageGrid"
```

---

### Task 6: Refactor Upload page to useUploadItem

**Files:**
- Modify: `src/pages/Upload.tsx`

**Interfaces:**
- Consumes: `useUploadItem()` from `src/hooks`.
- Behavior: `mutate({ file, title })` replaces `handleSubmit`'s fetch body; `isPending` replaces `loading`. File validation (mime type + size) stays in `handleFileChange`; `handleSubmit` only guards "no file chosen". Navigation + success toast move into the hook.

- [ ] **Step 1: Replace `src/pages/Upload.tsx`**

Remove `useNavigate`, the `getErrorMessage`/`api` imports, and the `loading` state. Keep the `useEffect` that revokes the object URL, `handleFileChange`, and all JSX — only the submit handler, `loading` usages, and imports change.

```tsx
import React, { ChangeEvent, useEffect, useState } from 'react'

import { MediaImage, Upload } from 'iconoir-react'
import { FormField, Loader } from '../components'
import { useUploadItem } from '../hooks'
import { toast } from 'sonner'

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
])

const MAX_FILE_SIZE = 50 * 1024 * 1024

const UploadPage = () => {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const { mutate, isPending } = useUploadItem()

    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview)
    }, [preview])

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null
        e.target.value = ''

        if (selected) {
            if (!ALLOWED_MIME_TYPES.has(selected.type)) {
                toast.error(`Unsupported image type: ${selected.type}`)
                return
            }

            if (selected.size > MAX_FILE_SIZE) {
                toast.error('File size must be 50MB or less')
                return
            }

            setFile(selected)
            setPreview(URL.createObjectURL(selected))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!file) {
            toast.warning('Please choose an image')
            return
        }

        mutate({ file, title })
    }

    return (
        <section>
            <div>
                <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                    Upload
                </h1>

                <p className="mt-2 max-w-xl text-sm text-foreground-secondary sm:text-base">
                    Upload an image from your device and share it with the community.
                </p>
            </div>

            <form className="mt-10 lg:mt-16" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-10 lg:grid-cols-10">
                    {/* Left */}
                    <div className="flex flex-col gap-5 lg:col-span-7">
                        <div>
                            <label
                                htmlFor="image"
                                className="mb-2 block text-sm font-medium text-foreground"
                            >
                                Image
                            </label>

                            <input
                                id="image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => document.getElementById('image')?.click()}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent sm:w-fit"
                            >
                                <Upload className="size-4" />
                                Choose Image
                            </button>
                        </div>

                        <FormField
                            labelName="Title (optional)"
                            type="text"
                            name="title"
                            placeholder="My uploaded image"
                            value={title}
                            handleChange={(e) => setTitle(e.target.value)}
                        />

                        <button
                            type="submit"
                            className="w-full rounded-md bg-success px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 sm:w-fit"
                        >
                            {isPending ? "Uploading..." : "Upload"}
                        </button>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt={title || 'Uploaded image'}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <MediaImage className="h-16 w-16 opacity-40" />
                            )}

                            {isPending && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default UploadPage
```

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Upload.tsx
git commit -m "refactor: use useUploadItem hook in Upload page"
```

---

### Task 7: Refactor GenerateImage page to useGenerateImage + useShareAiImage

**Files:**
- Modify: `src/pages/GenerateImage.tsx`

**Interfaces:**
- Consumes: `useGenerateImage()` and `useShareAiImage()` from `src/hooks`.
- Behavior: `generate({ prompt, size })` with call-site `onSuccess` updates the preview from the returned data-URI string; `share({ title, prompt, photo })` handles share + navigation. Both `loading` states (`generatingImg`, `loading`) are replaced by the two hooks' `isPending`. The "no prompt" / "no photo" guards remain as `toast.warning` before calling `mutate`.

- [ ] **Step 1: Replace `src/pages/GenerateImage.tsx`**

Remove `useNavigate`, the `getErrorMessage`/`api` imports, the `loading`/`generatingImg` states, the old `generateImage` function, and the fetch logic inside `handleSubmit`. Keep `handleChange`, `handleSurpriseMe`, and all JSX (only button `onClick`, submit handler, loading usages, and imports change).

```tsx
import React, { ChangeEvent, useState } from 'react'

import { MediaImage } from 'iconoir-react'
import { getRandomPrompt } from '../utils'
import { FormField, Loader, ImageSizePicker } from '../components'
import { useGenerateImage, useShareAiImage } from '../hooks'
import { IMAGE_SIZES, type ImageSizeKey } from '../constants'
import { toast } from 'sonner'

interface FormData {
    title: string
    prompt: string
    photo: string
}

const GenerateImage = () => {
    const [form, setForm] = useState<FormData>({ title: '', prompt: '', photo: '' })
    const [size, setSize] = useState<ImageSizeKey | ''>('square')

    const { mutate: generate, isPending: isGenerating } = useGenerateImage()
    const { mutate: share, isPending: isSharing } = useShareAiImage()

    const handleGenerate = () => {
        if (!form.prompt) {
            toast.warning('Please enter a prompt')
            return
        }
        generate(
            { prompt: form.prompt, size: size || undefined },
            {
                onSuccess: (photo) => setForm((prev) => ({ ...prev, photo })),
            },
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.prompt || !form.photo) {
            toast.warning('Please enter a prompt and generate an image')
            return
        }
        share({ title: form.title, prompt: form.prompt, photo: form.photo })
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(form.prompt)
        setForm({ ...form, prompt: randomPrompt })
    }

    return (
        <section>
            <div>
                <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                    Create
                </h1>

                <p className="mt-2 max-w-xl text-sm text-foreground-secondary sm:text-base">
                    Create imaginative and visually stunning images through AI and share them.
                </p>
            </div>

            <form className="mt-10 lg:mt-16" onSubmit={handleSubmit}>
                <div className="grid gap-10 lg:grid-cols-10">
                    {/* Left */}
                    <div className="flex flex-col gap-5 lg:col-span-7">
                        <FormField
                            labelName="Title"
                            type="text"
                            name="title"
                            placeholder="Type something..."
                            value={form.title}
                            handleChange={handleChange}
                        />

                        <FormField
                            labelName="Prompt"
                            type="textarea"
                            name="prompt"
                            placeholder="a bowl of soup that looks like a monster, knitted out of wool"
                            value={form.prompt}
                            handleChange={handleChange}
                            isSurpriseMe
                            handleSurpriseMe={handleSurpriseMe}
                        />

                        <ImageSizePicker
                            value={size}
                            onChange={setSize}
                        />

                        <button
                            type="button"
                            onClick={handleGenerate}
                            className="w-full rounded-md bg-success px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 sm:w-fit"
                        >
                            {isGenerating ? "Generating..." : "Generate Image"}
                        </button>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <div
                            className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
                            style={{
                                aspectRatio: `${size
                                    ? IMAGE_SIZES[size].width
                                    : IMAGE_SIZES.square.width
                                    } / ${size
                                        ? IMAGE_SIZES[size].height
                                        : IMAGE_SIZES.square.height
                                    }`,
                            }}
                        >
                            {form.photo ? (
                                <img
                                    src={form.photo}
                                    alt={form.prompt}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <MediaImage className="h-16 w-16 opacity-40" />
                            )}

                            {isGenerating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader />
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-foreground-secondary">
                                Once you have created the image you want, you can share it with
                                others in the community.
                            </p>

                            <button
                                type="submit"
                                className="mt-4 w-full rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90"
                            >
                                {isSharing ? "Sharing..." : "Share with the community"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    )
}

export default GenerateImage
```

- [ ] **Step 2: Typecheck + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: no errors. `useQuery`'s `error` is only referenced in `ImageGrid`; `GenerateImage` should compile with no unused imports (`React` is still needed for `React.FormEvent`).

- [ ] **Step 3: Commit**

```bash
git add src/pages/GenerateImage.tsx
git commit -m "refactor: use generate and share hooks in GenerateImage page"
```

---

### Task 8: Full verification + manual smoke test

**Files:**
- No changes (verification only).

- [ ] **Step 1: Clean typecheck + production build**

```bash
npx tsc --noEmit && npm run build
```

Expected: both exit clean with no output errors.

- [ ] **Step 2: Verify no straggler API calls remain in components/pages**

```bash
grep -rn "/api/v1" src --include="*.tsx"
```

Expected: no matches (all `/api/v1/*` strings live only in `src/api/*.ts`).

- [ ] **Step 3: Manual smoke test** (server on `:8080`, run `npm run dev` in `client/`)

With the server running, verify against the spec's three routes:

1. **`/`** — grid renders items after a brief Loader; no error toast on a healthy load.
2. **Cache on navigation** — open DevTools → Network, navigate `/` → `/gen-image` → back to `/`. Expect NO new `GET /api/v1/items` request within 60s (`staleTime`); grid appears instantly.
3. **Upload → grid refresh** — on `/upload`, choose a file and Upload. Expect success toast, redirect to `/`, and the new image present WITHOUT reload (background refetch from invalidation).
4. **Generate + share → grid refresh** — on `/gen-image`, enter a prompt, Generate (preview updates; "Generating..." label), then Share. Expect success toast, redirect to `/`, new image present without reload.
5. **Error path** — stop the server, hard-refresh `/`; expect one error toast (from the `useEffect` in `ImageGrid`).

- [ ] **Step 4: Report completion**

Summary of what changed and the smoke-test results.

---

## Self-Review Checklist

- **Spec coverage:** dependency install (Task 1), `src/api/` files (Task 2), four hooks + barrel (Task 3), `QueryClientProvider` with module-level client, `staleTime: 60_000`, `retry: 1`, Toaster sibling (Task 4), `ImageGrid` → `useItems` with error-effect toast (Task 5), `Upload` → `useUploadItem` (Task 6), `GenerateImage` → both hooks with call-site `onSuccess` preview + in-hook navigate (Task 7), build + manual smoke verification (Task 8). All 13 files from the spec's "Files to Create/Modify" list are covered.
- **Type consistency:** `Item`/`itemKeys`/`itemsOptions` defined in Task 2 and consumed identically in Task 5. `generateImage(prompt, size)` and `shareAiImage(form)` signatures used in Task 3 match their Task 2 definitions. `GenerateImageInput`/`UploadItemInput`/`ShareAiImageInput` used only where defined. `isPending` naming consistent across hooks and pages.
- **Placeholder scan:** every code step contains complete file contents; no "TBD"/"implement later" phrasing.
