import express from 'express'
import { itemService } from '../services/item.service.js'


import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { imageUpload } from '../middleware/uploadHandler.js'
import { imageService } from '../services/image.service.js'
import { itemRepository } from '../repositories/item.repository.js'

const router = express.Router()


const listItemsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})


const createItemAISchema = z.object({
  title: z.string().min(1).max(100),
  prompt: z.string().min(1).max(5000),
  photo: z.string().min(1),
})


const uploadItemFileSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200)
    .optional(),
})

router.get('/', async (req, res, next) => {
  try {
    const query = listItemsSchema.parse(req.query)

    const result = await itemService.list({
      page: query.page,
      limit: query.limit,
    })

    res.json({
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(400, error.errors.map(e => e.message).join(', ')))
      return
    }
    next(error)
  }
})


router.post('/upload-ai-image',
  (async (req, res, next) => {
    try {
      const { title, prompt, photo } = createItemAISchema.parse(req.body)

      const item = await itemService.createUploadedAIImage({
        title,
        prompt,
        base64: photo
      })

      res.status(201).json({ success: true, data: item })
    } catch (error) {


      console.error('POST /api/v1/items/upload-ai-image caught error:', error)

      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors.map(e => e.message).join(', ')))
        return
      }
      next(error)
    }
  })
)


router.post(
  '/upload-file',
  imageUpload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError(400, 'Image is required')
      }


      const body = uploadItemFileSchema.parse(req.body)

      const item = await itemService.createUploadedFile({
        file: req.file,
        title: body.title,
      })

      res.status(201).json({
        success: true,
        data: item
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, error.errors.map(e => e.message).join(', ')))
        return
      }
      next(error)
    }
  },
)


export default router
