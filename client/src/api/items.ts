import { queryOptions } from '@tanstack/react-query'
import { api } from '../utils'

export interface Item {
    id: string
    type: 'upload' | 'generated'
    title?: string
    prompt?: string
    imageUrl: string
    width: number
    height: number
    createdAt: string
}

export const itemKeys = {
    all: ['items'] as const,
    list: () => [...itemKeys.all, 'list'] as const,
}

export const itemsOptions = queryOptions({
    queryKey: itemKeys.list(),
    queryFn: () => api.get<Item[]>('/api/v1/items?limit=100'),
})
