import { AppError } from '../lib/errors.js'

const CF_API_BASE = 'https://api.cloudflare.com/client/v4/accounts'
const CF_MODEL_SCHNELL = '@cf/black-forest-labs/flux-1-schnell'
// const CF_MODEL_DEV = '@cf/black-forest-labs/flux-2-dev'
const CF_MODEL_DEV = '@cf/black-forest-labs/flux-2-klein-9b'

const CF_WIDTH_MIN = 256
const CF_WIDTH_MAX = 1920
const CF_HEIGHT_MIN = 256
const CF_HEIGHT_MAX = 1920

function getApiKey(): string {
  const key = process.env.CF_API_KEY
  if (!key) throw new AppError(500, 'CF_API_KEY is not configured')
  return key
}

function getAccountId(): string {
  const id = process.env.CF_ACCOUNT_ID
  if (!id) throw new AppError(500, 'CF_ACCOUNT_ID is not configured')
  return id
}

function getModel(url: string): string {
  return url.split('/').pop() || 'unknown'
}

function sanitizePrompt(prompt: string): string {
  return prompt.length > 100 ? prompt.slice(0, 97) + '...' : prompt
}

async function cfFetch(url: string, body: BodyInit, contentType?: string, extra?: { prompt: string; dimensions?: { width: number; height: number } }): Promise<string> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${getApiKey()}`,
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    const errMsg = errBody.errors?.[0]?.message || `Cloudflare API returned ${response.status}`

    console.error({
      service: 'cloudflare',
      model: getModel(url),
      status: response.status,
      error: errMsg,
      errors: errBody.errors,
      prompt: extra ? sanitizePrompt(extra.prompt) : undefined,
      dimensions: extra?.dimensions,
    })

    throw new AppError(response.status, errMsg)
  }

  const data = await response.json() as { result: { image: string } }
  return data.result.image
}

export async function generateImageSchnell(prompt: string, steps = 4): Promise<string> {
  return cfFetch(
    `${CF_API_BASE}/${getAccountId()}/ai/run/${CF_MODEL_SCHNELL}`,
    JSON.stringify({ prompt, steps }),
    'application/json',
    { prompt },
  )
}

export async function generateImageDev(
  prompt: string,
  dimensions: { width: number; height: number },
  steps = 4,
): Promise<string> {
  const { width, height } = dimensions

  if (
    width < CF_WIDTH_MIN || width > CF_WIDTH_MAX ||
    height < CF_HEIGHT_MIN || height > CF_HEIGHT_MAX
  ) {
    throw new AppError(
      400,
      `Dimensions must be between ${CF_WIDTH_MIN}x${CF_HEIGHT_MIN} and ${CF_WIDTH_MAX}x${CF_HEIGHT_MAX}, got ${width}x${height}`,
    )
  }

  // Node.js undici < 7.1.0 omitted trailing CRLF in multipart boundaries.
  // Cloudflare API accepts both, so built-in FormData is safe here.
  // If a stricter API rejects multipart, switch to `form-data` npm package.

  const formData = new FormData()
  formData.append('prompt', prompt)
  formData.append('width', String(width))
  formData.append('height', String(height))
  formData.append('steps', String(steps))


  return cfFetch(
    `${CF_API_BASE}/${getAccountId()}/ai/run/${CF_MODEL_DEV}`,
    formData,
    undefined,
    { prompt, dimensions },
  )
}
