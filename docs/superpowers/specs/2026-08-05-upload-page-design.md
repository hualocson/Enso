# Upload Page Design

Date: 2026-08-05

## Summary

Add a `/upload` page to the client that lets a user pick an image file, optionally
enter a title, and upload it via the existing server API `POST /api/v1/items/upload-file`.

## Server API (already implemented)

- `POST /api/v1/items/upload-file`
- Accepts `multipart/form-data`:
  - `image` — single file, required. Allowed types: `image/jpeg`, `image/png`,
    `image/webp`, `image/heic`, `image/heif`. Max size 50MB.
  - `title` — optional string, max 200 chars.
- Returns `201` with `{ data: item }` where `item` is:
  `{ id, type: 'upload', title?, imageUrl, width, height, createdAt, updatedAt }`.

No server changes are required.

## Scope

In scope:

- New `Upload` page at route `/upload`.
- Multipart upload helper in `src/utils/api.ts`.
- File validation (type + size) before upload.

Out of scope:

- Navigation link (route-only, per user decision).
- Displaying uploaded items on the Home page (Home still reads `/api/v1/posts`).
- Drag-and-drop file selection (picker button only).
- Any server-side changes.

## Design

### 1. API helper — `src/utils/api.ts`

Add a `postForm` method to the existing `api` object:

```ts
postForm: <T>(path: string, formData: FormData) => requestForm<T>('POST', path, formData)
```

`requestForm` mirrors the existing `request` helper but:

- Does not set `Content-Type` manually (browser sets the multipart boundary).
- Passes `FormData` as the body directly (no JSON serialization).
- Uses the same error handling: reads `json.message`/`json.error`, throws on
  non-ok responses, returns `json.data ?? json`.

### 2. Page — `src/pages/Upload.tsx`

Mirrors the visual structure of `CreatePost`:

- Section heading "Upload" + a short description paragraph.
- Form on the left, preview on the right (same `lg:grid-cols-10` layout).
- Hidden `<input type="file">` with
  `accept="image/jpeg,image/png,image/webp,image/heic,image/heif"` triggered by a
  styled button labeled "Choose Image" (uses `MediaImage` icon from `iconoir-react`).
- Optional title field via the existing `FormField` component.
- Preview: bordered box with fixed aspect ratio (square, matching the existing
  preview pattern). Shows the selected image via `URL.createObjectURL`, or a
  `MediaImage` placeholder when none is selected.
- Upload button with loading state ("Uploading..." while in flight).

State:

- `file: File | null`
- `preview: string | null` (object URL)
- `title: string`
- `loading: boolean`

### 3. Validation (before upload)

Reject and `toast.error` immediately when:

- No file selected.
- File MIME type not in the allowed set
  (`image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`).
- File size > 50MB.

### 4. Submit flow

1. Build `FormData`, append `image` (the file) and `title` (if non-empty).
2. Call `api.postForm('/api/v1/items/upload-file', formData)`.
3. On success: `toast.success`, revoke the object URL, `navigate('/')`.
4. On error: `toast.error(getErrorMessage(error))`.

### 5. Wiring

- Register route in `src/App.tsx`: `<Route path="/upload" element={<Upload />} />`.
- Export `Upload` from `src/pages/index.ts`.

## Files touched

- `src/utils/api.ts` — add `postForm`.
- `src/pages/Upload.tsx` — new.
- `src/pages/index.ts` — export `Upload`.
- `src/App.tsx` — add route.

## Testing / verification

- `npm run build` passes (project has no test framework).
- Manual: upload a valid image → success toast, redirected to `/`; upload a `.txt`
  file → immediate client-side error; upload a >50MB image → immediate error.

## Conventions followed

- Arrow-function components with `export default`.
- `cn` utility for className logic.
- `sonner` `toast` for notifications, `iconoir-react` for icons.
- 4-space indentation, no comments in code.
- API base URL via existing `api` util (`VITE_API_URL`).
