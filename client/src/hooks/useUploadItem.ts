import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { itemKeys } from '../api'
import { api, getErrorMessage } from '../utils'

interface UploadItemInput {
    file: File
    title: string
}

export function useUploadItem() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async ({ file, title }: UploadItemInput) => {
            const formData = new FormData()
            formData.append('image', file)
            if (title.trim()) formData.append('title', title.trim())
            await api.postForm('/api/v1/items/upload-file', formData)
        },
        onSuccess: () => {
            toast.success('Image uploaded successfully')
            queryClient.invalidateQueries({ queryKey: itemKeys.all })
            navigate('/')
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
