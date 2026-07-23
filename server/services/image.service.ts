import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/errors.js'

export interface UploadResult {
    url: string
    secure_url: string
    public_id: string
}

async function uploadImage(base64: string): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(base64, {
            folder: 'dalle',
            use_filename: true,
            fetch_format: 'auto',
            quality: 'auto',
        })
        return {
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
        }
    } catch (error) {
        throw new AppError(
            502,
            error instanceof Error ? error.message : 'Image upload failed',
        )
    }
}

async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        throw new AppError(
            502,
            error instanceof Error ? error.message : 'Image delete failed',
        )
    }
}

export const imageService = { uploadImage, deleteImage }
