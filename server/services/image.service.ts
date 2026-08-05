import cloudinary from '../lib/cloudinary.js'
import fs from 'node:fs'
import { AppError } from '../lib/errors.js'

const UPLOAD_PRESET = process.env.UPLOAD_PRESET;

export interface UploadResult {
  url: string
  secure_url: string
  public_id: string
  height: number;
  width: number
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
      width: result.width,
      height: result.height,
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


const uploadImageFile = (
  filePath: string,
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      if (!UPLOAD_PRESET) {
        throw new Error("UPLOAD_PRESET not set")
      }

      const uploadStream = cloudinary.uploader.unsigned_upload_stream(
        UPLOAD_PRESET,
        {
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new AppError(
                502,
                error instanceof Error
                  ? error.message
                  : 'Image upload failed',
              ),
            )
            return
          }

          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          })
        },
      )

      const readStream = fs.createReadStream(filePath)

      readStream.on('error', (error) => {
        uploadStream.destroy()

        reject(
          new AppError(
            500,
            error instanceof Error
              ? error.message
              : 'Failed to read image',
          ),
        )
      })

      readStream.pipe(uploadStream)
    } catch (error) {
      reject(
        new AppError(
          502,
          error instanceof Error
            ? error.message
            : 'Image upload failed',
        ),
      )
    }
  })
}

export const imageService = { uploadImage, deleteImage, uploadImageFile }
