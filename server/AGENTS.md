# enso — AGENTS.md

## Project Overview
Full-stack AI image generation app (enso): React + Vite + TypeScript frontend, Express + TypeScript backend, MongoDB + Cloudinary storage, Cloudflare Workers AI (FLUX.1 Schnell) for generation.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 8, TypeScript, Tailwind CSS 3, react-router-dom 6 |
| Backend | Express 4, TypeScript, tsx (dev runner) |
| Database | MongoDB via Mongoose |
| AI | Cloudflare Workers AI (FLUX.1 Schnell via REST API) |
| Storage | Cloudinary SDK |
| Validation | Zod |

## Commands
- `npm run dev` — Start with hot-reload (tsx watch index.ts)
- `npm run build` — TypeScript compile (tsc)
- `npm run start` — Run compiled JS (node dist/index.js)

## API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/api/v1/dalle` | Generate image via Cloudflare Workers AI / FLUX.1 Schnell (body: `{ prompt }`) |
| GET | `/api/v1/posts` | List posts (query: `?page=&limit=`) |
| POST | `/api/v1/posts` | Create post (Zod validated, Cloudinary upload, MongoDB save) |

## Architecture & Data Flow
1. User enters prompt → `POST /api/v1/dalle` → Cloudflare Workers AI returns base64 image → displayed
2. User shares → `POST /api/v1/posts` → Zod validates → Cloudinary uploads → Mongoose saves → redirect home
3. Home loads → `GET /api/v1/posts` → responsive grid with search/filter

## Code Conventions
- **Imports**: Use `.js` extension in server TypeScript imports (ESM requirement)
- **Error handling**: Use `AppError`, `NotFoundError`, `ValidationError` from `server/lib/errors.ts`; global handler in `server/middleware/errorHandler.ts`
- **Validation**: Zod schemas in route files
- **Repository pattern**: `server/repositories/post.repository.ts` for DB access

## Gotchas
- Server runs on **port 8080** (not 3000 as README says)
- No testing framework or test files exist
- `server/.env` contains real credentials — never commit
- Cloudflare env vars: `CF_API_KEY` (API token), `CF_ACCOUNT_ID` (Cloudflare account ID)
- Model: `@cf/black-forest-labs/flux-1-schnell` via `POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/{MODEL}`
