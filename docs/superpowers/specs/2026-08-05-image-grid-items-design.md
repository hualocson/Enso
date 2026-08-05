# Image Grid: Fetch Items Instead of Posts

## Context

The server has a new `GET /api/v1/items` endpoint that lists `Item` documents from MongoDB. Items represent both uploaded images (`type: 'upload'`) and generated images (`type: 'generated'`). The client's home gallery currently fetches the legacy `GET /api/v1/posts` endpoint and renders a `Card` component that expects a `name` prop.

Goal: switch the gallery to the items API and update the card display to use `title` instead of `name`.

## API Contract

`GET /api/v1/items?page=1&limit=100` returns:

```json
{
  "data": [
    {
      "id": "string",
      "type": "upload" | "generated",
      "title": "string | undefined",
      "prompt": "string | undefined",
      "imageUrl": "string",
      "width": "number",
      "height": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "pagination": { "page": 1, "limit": 100, "total": 0, "totalPages": 0 }
}
```

Notes:
- Server sorts by `createdAt` descending (`item.repository.ts`), so the client must **not** reverse the list.
- `title` is optional — uploaded files may be created without one.
- The client `api.get` helper unwraps `json.data`, so the array arrives directly.

## Changes

### `src/components/Card.tsx`

- Rename prop `name` → `title`, `photo` → `imageUrl`.
- Props become: `id`, `title`, `prompt`, `imageUrl`, `tilt`.
- Hover label: display `title`. When `title` is empty/missing, hide the name/title row entirely (the download button still renders).
- Download button calls `downloadImage(id, imageUrl)`.

### `src/components/home/ImageGrid.tsx`

- Replace the `Post` interface with an `Item` interface matching the API document: `id`, `type`, `title`, `prompt`, `imageUrl`, `width`, `height`, `createdAt`.
- Fetch `GET /api/v1/items?limit=100` instead of `/api/v1/posts`.
- Remove `.reverse()`.
- Render cards as `<Card key={item.id} {...item} tilt={getDeg(index)} />`.
- Empty-state text changes from "No Posts Yet" to "No Items Yet".

### Unchanged

- `src/utils/api.ts`, `downloadImage`, error handling, loading spinner, layout, tilt logic.

## Success Criteria

- `npm run build` passes (no test framework exists).
- Gallery loads items from `/api/v1/items` (newest first) instead of posts.
- Card hover shows the item `title`; no label when title is absent.
- Download button downloads the item's `imageUrl`.
