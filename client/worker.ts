/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher
  API_URL: string
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env, ctx)
    }

    return env.ASSETS.fetch(request)
  },
}

/**
 * Handle API requests.
 */
async function handleApi(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url)

  // Cache only the public gallery list.
  if (
    request.method === 'GET' &&
    url.pathname === '/api/v1/items'
  ) {
    return getCachedItems(request, env, ctx)
  }

  // Everything else goes directly to Render.
  return proxyRequest(request, env)
}

/**
 * Get items from Cloudflare Cache.
 *
 * Behavior:
 *
 * Cache MISS
 *   → Request Render
 *   → Store response
 *   → Return response
 *
 * Cache HIT + fresh
 *   → Return cache immediately
 *
 * Cache HIT + stale
 *   → Return stale cache immediately
 *   → Refresh cache in background
 */
async function getCachedItems(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cache = getCloudflareCache()

  /**
   * The full URL is used as the cache key.
   *
   * For example:
   *
   * /api/items?limit=20
   * /api/items?limit=20&cursor=abc
   *
   * will have separate cache entries.
   */
  const cacheKey = new Request(request.url, {
    method: 'GET',
  })

  const cached = await cache.match(cacheKey)

  // ----------------------------------------
  // CACHE MISS
  // ----------------------------------------

  if (!cached) {
    return fetchAndCache(
      cacheKey,
      request,
      env,
      cache,
    )
  }

  const cachedAt = Number(
    cached.headers.get('X-Enso-Cached-At') ?? 0,
  )

  const age = Date.now() - cachedAt

  // ----------------------------------------
  // CACHE HIT - FRESH
  // ----------------------------------------

  if (cachedAt > 0 && age < CACHE_TTL) {
    return withCacheStatus(cached, 'HIT')
  }

  // ----------------------------------------
  // CACHE HIT - STALE
  // ----------------------------------------

  /**
   * Return old data immediately.
   *
   * Render is called in the background.
   * The user does NOT wait for Render.
   */
  ctx.waitUntil(
    refreshCache(
      cacheKey,
      request,
      env,
      cache,
    ),
  )

  return withCacheStatus(cached, 'STALE')
}

/**
 * Request data from Render and store it in Cloudflare Cache.
 */
async function fetchAndCache(
  cacheKey: Request,
  request: Request,
  env: Env,
  cache: Cache,
): Promise<Response> {
  const response = await proxyRequest(request, env)

  if (!response.ok) {
    return response
  }

  const cachedResponse = createCachedResponse(
    response,
    'MISS',
  )

  await cache.put(
    cacheKey,
    cachedResponse.clone(),
  )

  return cachedResponse
}

/**
 * Refresh an existing stale cache entry.
 *
 * This function runs in the background using ctx.waitUntil().
 */
async function refreshCache(
  cacheKey: Request,
  request: Request,
  env: Env,
  cache: Cache,
): Promise<void> {
  try {
    const response = await proxyRequest(
      request,
      env,
    )

    if (!response.ok) {
      return
    }

    const cachedResponse = createCachedResponse(
      response,
      'REFRESH',
    )

    await cache.put(
      cacheKey,
      cachedResponse,
    )
  } catch (error) {
    console.error(
      'Failed to refresh items cache:',
      error,
    )
  }
}

/**
 * Create the response that will be stored in Cloudflare Cache.
 */
function createCachedResponse(
  response: Response,
  cacheStatus: string,
): Response {
  const headers = new Headers(response.headers)

  /**
   * Store the timestamp ourselves so we can determine
   * whether the cached data is fresh or stale.
   */
  headers.set(
    'X-Enso-Cached-At',
    Date.now().toString(),
  )

  /**
   * Useful for debugging in browser DevTools.
   */
  headers.set(
    'X-Enso-Cache',
    cacheStatus,
  )

  /**
   * Don't let the browser cache this response.
   *
   * The cache we care about is Cloudflare's cache.
   */
  headers.set(
    'Cache-Control',
    'no-store',
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Add cache status to a cached response.
 */
function withCacheStatus(
  response: Response,
  status: 'HIT' | 'STALE',
): Response {
  const headers = new Headers(response.headers)

  headers.set(
    'X-Enso-Cache',
    status,
  )

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Proxy the request to Render.
 */
async function proxyRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const incomingUrl = new URL(request.url)

  const targetUrl =
    `${env.API_URL}${incomingUrl.pathname}${incomingUrl.search}`

  return fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body:
      request.method === 'GET' ||
        request.method === 'HEAD'
        ? undefined
        : request.body,
  })
}

/**
 * Cloudflare's Cache API exposes `caches.default`,
 * but the DOM CacheStorage type doesn't know about it.
 *
 * This cast bridges the browser DOM type and the
 * Cloudflare Workers runtime type.
 */
function getCloudflareCache(): Cache {
  return (
    globalThis as unknown as {
      caches: {
        default: Cache
      }
    }
  ).caches.default
}
