import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generateImage } from '../api'
import { getErrorMessage } from '../utils'

interface GenerateImageInput {
    prompt: string
    size?: string
}

export function useGenerateImage() {
    return useMutation({
        mutationFn: ({ prompt, size }: GenerateImageInput) =>
            generateImage(prompt, size),
        onError: (error) => toast.error(getErrorMessage(error)),
    })
}
