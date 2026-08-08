import { api } from '../utils'

export async function generateImage(
    prompt: string,
    size?: string,
): Promise<string> {
    const body: Record<string, string> = { prompt }
    if (size) body.size = size
    const data = await api.post<{ photo: string }>('/api/v1/dalle', body)
    return `data:image/jpeg;base64,${data.photo}`
}

export interface ShareAiImageInput {
    title: string
    prompt: string
    photo: string
}

export function shareAiImage(form: ShareAiImageInput): Promise<void> {
    return api.post<void>('/api/v1/items/upload-ai-image', form)
}
