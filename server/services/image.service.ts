import cloudinary from '../lib/cloudinary.js'
import { AppError } from '../lib/errors.js'

const UPLOAD_PRESET = process.env.UPLOAD_PRESET;

export interface UploadResult {
  url: string
  secure_url: string
  public_id: string
}

async function uploadImage(base64: string): Promise<UploadResult> {
  try {
    if (!UPLOAD_PRESET) {
      throw new Error("UPLOAD_PRESET not set")
    }
    const result = await cloudinary.uploader.unsigned_upload(base64, UPLOAD_PRESET, {
      resource_type: "image"
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
