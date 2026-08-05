# Upload Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/upload` page to the client that lets a user pick an image file, optionally enter a title, and upload it to the existing `POST /api/v1/items/upload-file` endpoint.

**Architecture:** A new `Upload` page component (mirroring `CreatePost`'s layout) calls a new `postForm` multipart helper on the existing `api` util. File type/size is validated client-side before upload. On success the page toasts and redirects to `/`. No server changes.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, react-router-dom 6, sonner (toasts), iconoir-react (icons).

## Global Constraints

- Server API: `POST /api/v1/items/upload-file`, `multipart/form-data` with required field `image` (jpeg/png/webp/heic/heif, max 50MB) and optional field `title` (max 200 chars). Returns `201 { data: item }`.
- API base URL comes from the existing `api` util (`VITE_API_URL`, default `http://localhost:8080`). Do not hardcode a URL in the page.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`. Max file size: 50MB (50 * 1024 * 1024 bytes).
- Route-only: do NOT add a nav link to the Header.
- Follow client conventions: arrow-function components with `export default`; `cn` util for className logic; `sonner` `toast`; `iconoir-react` icons; 4-space indentation; no code comments.
- No test framework exists. Verify each task with `npx tsc --noEmit` and `npm run build` (run from `client/`).
- UI copy conventions from `CreatePost`: headings are `text-3xl font-extrabold text-foreground sm:text-4xl`; buttons use `text-sm font-medium text-surface` with `rounded-md`.

---

### Task 1: Add multipart `postForm` helper to `api`

**Files:**
- Modify: `src/utils/api.ts`

**Interfaces:**
- Consumes: nothing new (uses existing `BASE_URL`).
- Produces: `api.postForm<T>(path: string, formData: FormData): Promise<T>` — used by Task 2.

- [ ] **Step 1: Add the `requestForm` helper and `postForm` method**

Add a `requestForm` function (mirrors the existing `request`, but sends `FormData` directly and does not set a `Content-Type` header, so the browser sets the multipart boundary), then add `postForm` to the `api` object.

```ts
const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(
      (json.message as string) ??
      (json.error as string) ??
      `Request failed with status ${response.status}`,
    )
  }

  return (json.data ?? json) as T
}

async function requestForm<T>(
  method: string,
  path: string,
  formData: FormData,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    body: formData,
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(
      (json.message as string) ??
      (json.error as string) ??
      `Request failed with status ${response.status}`,
    )
  }

  return (json.data ?? json) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>('POST', path, formData),
}
```

- [ ] **Step 2: Verify types and build**

Run (from `client/`):
```bash
npx tsc --noEmit
npm run build
```
Expected: no type errors, Vite build completes with `✓ built in ...`.

- [ ] **Step 3: Commit**

```bash
git add src/utils/api.ts
git commit -m "feat: add postForm multipart helper to api util"
```

---

### Task 2: Create the `/upload` page and wire the route

**Files:**
- Create: `src/pages/Upload.tsx`
- Modify: `src/pages/index.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `api.postForm<T>(path, formData)` from Task 1; existing `FormField`, `Loader` from `src/components`; existing `getErrorMessage` from `src/utils`; `MediaImage` and `Upload` icons from `iconoir-react`; `toast` from `sonner`.
- Produces: `Upload` page component (default export) at route `/upload`.

- [ ] **Step 1: Create `src/pages/Upload.tsx`**

```tsx
import React, { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MediaImage, Upload } from 'iconoir-react'
import { getErrorMessage, api } from '../utils'
import { FormField, Loader } from '../components'
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
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null

    if (selected) {
      if (!ALLOWED_MIME_TYPES.has(selected.type)) {
        toast.error(`Unsupported image type: ${selected.type}`)
        return
      }

      if (selected.size > MAX_FILE_SIZE) {
        toast.error('File size must be 50MB or less')
        return
      }

      if (preview) URL.revokeObjectURL(preview)
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.warning('Please choose an image')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      if (title.trim()) formData.append('title', title.trim())

      await api.postForm('/api/v1/items/upload-file', formData)
      toast.success('Image uploaded successfully')
      navigate('/')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
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

      <form className="mt-10 lg:mt-16" onSubmit={handleSubmit}>
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
              {loading ? "Uploading..." : "Upload"}
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

              {loading && (
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

- [ ] **Step 2: Export `Upload` from `src/pages/index.ts`**

Replace the file's contents with:

```ts
import Home from './Home'
import CreatePost from './CreatePost'
import Upload from './Upload'

export { Home, CreatePost, Upload }
```

- [ ] **Step 3: Register the route in `src/App.tsx`**

Replace the import line and add a route:

```tsx
import { Home, CreatePost, Upload } from './pages'
```

```tsx
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/upload" element={<Upload />} />
```

- [ ] **Step 4: Verify types and build**

Run (from `client/`):
```bash
npx tsc --noEmit
npm run build
```
Expected: no type errors, Vite build completes with `✓ built in ...`.

- [ ] **Step 5: Manual smoke test**

Run `npm run dev` (from `client/`) and `npm start` (from `server/`, port 8080). Navigate to `http://localhost:5173/upload`. Expected:
- Uploading a valid `.png`/`.jpg` shows a success toast and redirects to `/`.
- Selecting a `.txt` file shows the toast `Unsupported image type: text/plain` immediately (no network request).
- Submitting with no file shows `Please choose an image`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Upload.tsx src/pages/index.ts src/App.tsx
git commit -m "feat: add upload page"
```
