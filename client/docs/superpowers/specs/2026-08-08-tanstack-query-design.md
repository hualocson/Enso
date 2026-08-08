# TanStack Query Integration Design

## Overview
Integrate [TanStack Query](https://tanstack.com/query/) v5 into the Vite + React + TypeScript client to replace hand-rolled `useState`/`useEffect` fetching with a typed query layer providing caching, background synchronization, and automatic invalidation after mutations.

## Architecture

### Dependency
- Install `@tanstack/react-query@^5.101.4` (current v5; peer deps support React 18).
- No DevTools (`@tanstack/react-query-devtools` skipped by decision).

### New module: `src/api/` (pure, no React)
| File | Contents |
|------|----------|
| `src/api/items.ts` | `Item` type (moved from `ImageGrid.tsx`), `itemKeys` key factory, `itemsOptions` via `queryOptions()` |
| `src/api/generate.ts` | pure functions `generateImage(prompt, size)` (returns `data:image/jpeg;base64,...` string) and `shareAiImage(form)` for the two `POST` mutation endpoints |
| `src/api/index.ts` | barrel re-exports |

```typescript
// src/api/items.ts
export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all, 'list'] as const,
}

export const itemsOptions = queryOptions({
  queryKey: itemKeys.list(),
  queryFn: () => api.get<Item[]>('/api/v1/items?limit=100'),
})
```

### New hooks: `src/hooks/` (consumed by pages)
| Hook | Wraps | Notes |
|------|-------|-------|
| `useItems` | `useQuery(itemsOptions)` | exposes `data`, `isPending`, `error` |
| `useUploadItem` | `useMutation(api.postForm /api/v1/items/upload-file)` | onSuccess → toast + invalidate + navigate |
| `useGenerateImage` | `useMutation(api.post /api/v1/dalle)` | wraps `generateImage(prompt, size)`; returns processed `data:image/jpeg;base64,...` string; onError toasts |
| `useShareAiImage` | `useMutation(api.post /api/v1/items/upload-ai-image)` | onSuccess → toast + invalidate + navigate |

- `api.ts` wrapper remains untouched as the base fetch layer; all queryFns/mutationFns delegate to it.
- All four new hooks exported from the existing `src/hooks/index.ts` barrel.

### Provider setup
- `src/main.tsx`: module-level `QueryClient` (created once, outside component) with `defaultOptions.queries = { staleTime: 60_000, retry: 1 }`.
- Wrap `<App />` in `QueryClientProvider` inside `<StrictMode>`; `<Toaster>` remains a sibling.

## Data Flow
```
main.tsx
  └── QueryClientProvider (module-level QueryClient)
        └── App (BrowserRouter)
              └── Pages
                    ├── Home
                    │     └── ImageGrid → useItems()
                    ├── GenerateImage → useGenerateImage() + useShareAiImage()
                    └── Upload → useUploadItem()
```

- **ImageGrid** (`/`): `const { data, isPending } = useItems()`; drops `useState`/`useEffect`/`setLoading`; `isPending` drives the existing Loader; `data` feeds `RenderCards`. Caching/dedup means navigation and StrictMode remounts do not refetch within `staleTime`.
- **GenerateImage**: `const { mutate, isPending, isPending: isGenerating }` from the two hooks replaces `generateImage`/`handleSubmit` and both `loading` states. Preview updates via call-site `onSuccess: (photo) => setForm(...)`; `navigate('/')` stays in the share hook.
- **Upload**: `useUploadItem().mutate` + `isPending` replaces `handleSubmit`/`loading`; success toast + `navigate('/')` in the hook.
- **Invalidation**: after upload or share succeeds, `invalidateQueries({ queryKey: itemKeys.all })` refetches the grid in the background → new images appear on return to Home with no reload.

## Error Handling
- **Mutations**: `onError: (e) => toast.error(getErrorMessage(e))` defined inside each hook. Pages call `mutate(variables)` with no `try/catch` and no local `setLoading`.
- **GenerateImage preview**: `useGenerateImage`'s `onError` toasts in-hook; the component supplies `onSuccess` at the `mutate()` call site to update the preview from the returned photo string.
- **Query (ImageGrid)**: `useItems` exposes `error`; a `useEffect` watches it and toasts once per error, preserving today's UX (grid shows "No Items Yet" empty state). No global `QueryCache.onError` — toasts stay local to match the codebase pattern.
- **Staleness**: within `staleTime` (60s), remounts/focus return cached data instantly; background refetches occur after 60s and on window focus (default).

## Testing
- No test framework exists in the repo; the added logic is thin delegation over `api.ts`.
- Verification: `npm run build` (typecheck + compile) plus manual smoke test of the three routes (`/`, `/gen-image`, `/upload`): initial load, navigation away/back (no refetch within staleTime), upload → grid refreshes, generate + share → grid refreshes.

## Files to Create/Modify
1. **Install**: `@tanstack/react-query@^5.101.4`
2. **Create**: `src/api/items.ts`
3. **Create**: `src/api/generate.ts`
4. **Create**: `src/api/index.ts`
5. **Create**: `src/hooks/useItems.ts`
6. **Create**: `src/hooks/useUploadItem.ts`
7. **Create**: `src/hooks/useGenerateImage.ts`
8. **Create**: `src/hooks/useShareAiImage.ts`
9. **Modify**: `src/hooks/index.ts` (add exports)
10. **Modify**: `src/main.tsx` (QueryClientProvider)
11. **Modify**: `src/components/home/ImageGrid.tsx` (useItems)
12. **Modify**: `src/pages/Upload.tsx` (useUploadItem)
13. **Modify**: `src/pages/GenerateImage.tsx` (useGenerateImage + useShareAiImage)
