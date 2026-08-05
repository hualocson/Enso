import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'

const uploadDirectory = path.resolve(
  process.cwd(),
  'tmp/uploads',
)

fs.mkdirSync(uploadDirectory, {
  recursive: true,
})

const MAX_FILE_SIZE = 50 * 1024 * 1024

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDirectory)
    },

    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname)

      cb(
        null,
        `${crypto.randomUUID()}${extension}`,
      )
    },
  }),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(
        new Error(
          `Unsupported image type: ${file.mimetype}`,
        ),
      )

      return
    }

    cb(null, true)
  },
})
