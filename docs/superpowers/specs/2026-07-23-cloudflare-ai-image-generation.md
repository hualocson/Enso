# Cloudflare Workers AI Image Generation

## Overview

Replace OpenAI DALL-E image generation with Cloudflare Workers AI REST API (FLUX.1 Schnell model) for the server's image generation endpoint.

## Motivation

- Remove dependency on OpenAI API
- Use Cloudflare's edge AI infrastructure (lower latency, global network)
- Leverage existing Cloudflare account

## Changes

### Environment Variables

- Rename `CF_WOKERS_AI_API_KEY` to `CF_API_KEY`
- Add `CF_ACCOUNT_ID`

### Dependencies

- Remove `openai` from `package.json`
- Add `form-data` — for multipart/form-data requests required by Cloudflare Workers AI

### Dependencies

- Remove `openai` from `package.json`
- Run `npm install` to update `package-lock.json`

### API Endpoint

**POST /api/v1/dalle** (route path unchanged)

Request body: `{ prompt: string }`

Internally calls:
```
POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell
```

Request format: JSON body with:
- `prompt` — text prompt from request body
- `steps` — 4 (default diffusion steps for flux-1-schnell)

Auth: `Authorization: Bearer {CF_API_KEY}`

Response handling:
- Cloudflare returns JSON with `result.image` (base64-encoded PNG)
- Return `{ photo: data.result.image }` — same response shape as before, zero client impact

Error handling:
- Missing prompt → 400 `{ error: 'Prompt is required' }`
- Cloudflare non-200 → parse error from Cloudflare response, forward message
- Return 500 with error message

### Files Modified

1. `server/.env` — env var names/values
2. `server/package.json` — remove `openai`
3. `server/package-lock.json` — updated via `npm install`
4. `server/routes/dalleRoutes.ts` — implementation swap

### Test Plan

- `POST /api/v1/dalle` with `{ prompt: "a cat" }` returns `{ photo: "<base64>" }`
- `POST /api/v1/dalle` with missing/empty prompt returns 400
- `npm run build` succeeds with no TypeScript errors
