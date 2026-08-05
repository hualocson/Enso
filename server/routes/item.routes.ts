import express from 'express'
import { itemService } from '../services/item.service.js'


import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { imageUpload } from '../middleware/uploadHandler.js'

const router = express.Router()


const listItemsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
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
