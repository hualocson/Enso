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
