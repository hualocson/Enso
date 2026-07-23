# Cloudinary Integration Upgrade

## Overview

Upgrade the server's Cloudinary integration from an inline configuration in a route handler to a modular, production-ready setup using current best practices (2026).

## Current State

- `cloudinary` SDK v2.7.0 (latest is 2.10.0)
- Config inline in `server/routes/postRoutes.ts` using individual env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- `.env` file is missing Cloudinary env vars entirely
- Upload call: `cloudinary.uploader.upload(photo)` — no options, no error handling
- No dedicated Cloudinary module or service layer
- Uploaded image public IDs are auto-generated (no folder structure)

## Design

### 1. Configuration Module (`server/lib/cloudinary.ts`)

New file that configures and exports the Cloudinary v2 instance.

- Uses `CLOUDINARY_URL` environment variable (Cloudinary's recommended approach — single URL encodes cloud_name, api_key, api_secret)
- Sets `secure: true` for HTTPS URLs
- Imports configured instance so other modules use the same singleton

### 2. Image Service (`server/services/image.service.ts`)

New service layer for Cloudinary upload operations.

- `uploadImage(base64: string, options?: UploadOptions)` — uploads base64 image data, returns `{ url, secure_url, public_id, ... }`
  - Uploads to folder `dalle` for organization
  - Applies `fetch_format: 'auto'` and `quality: 'auto'` for optimization
  - Sets `use_filename: true` for readable public IDs
- `deleteImage(publicId: string)` — deletes an image by public_id (for future cleanup)
- Wraps errors into typed AppError instances

### 3. Route Updates (`server/routes/postRoutes.ts`)

- Remove inline `cloudinary.config()` call
- Remove direct `cloudinary.uploader.upload()` call
- Replace with `imageService.uploadImage(photo)`
- Store `secure_url` in the database instead of `url`

### 4. Environment Variables

- Add `CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name` to `.env`
- Remove individual `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` from config (the URL covers all three)

### 5. SDK Upgrade

- `cloudinary` from `2.7.0` to `2.10.0` in `package.json`

## Data Flow (unchanged externally)

```
Client POST /api/v1/posts { name, prompt, photo: "data:image/..." }
  → Route validates with Zod
  → imageService.uploadImage(photo)     [NEW]
     → cloudinary.uploader.upload()     [with options]
     → returns { secure_url, public_id }
  → postRepository.create({ name, prompt, photo: secure_url })
  → Response { success: true, data: { ... } }
```

## Future Considerations (out of scope)

- Upload presets for client-side uploads
- Admin API for bulk management
- Webhook notifications for upload status
- Image transformation on delivery
