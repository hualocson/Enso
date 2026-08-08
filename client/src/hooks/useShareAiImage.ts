import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { itemKeys, shareAiImage } from '../api'
import { getErrorMessage } from '../utils'

export function useShareAiImage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: shareAiImage,
        onSuccess: () => {
            toast.success('Image shared successfully')
            queryClient.invalidateQueries({ queryKey: itemKeys.all })
            navigate('/')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
