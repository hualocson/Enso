const BASE_URL = 'http://localhost:8080'

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

export const api = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
}
