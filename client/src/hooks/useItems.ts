import { useQuery } from '@tanstack/react-query'
import { itemsOptions } from '../api'

export function useItems() {
    return useQuery(itemsOptions)
}
