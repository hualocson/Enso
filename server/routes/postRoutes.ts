import express from 'express'
import { z } from 'zod'
import { postRepository } from '../repositories/post.repository.js'
import { AppError } from '../lib/errors.js'
import { imageService } from '../services/image.service.js'

const router = express.Router()

const createPostSchema = z.object({
    name: z.string().min(1).max(100),
    prompt: z.string().min(1).max(1000),
    photo: z.string().min(1),
})

const listPostsSchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
})

router.route('/').get(async (req, res, next) => {
    try {
        const query = listPostsSchema.parse(req.query)
        const result = await postRepository.list(query)
        res.status(200).json({ success: true, ...result })
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, error.errors.map(e => e.message).join(', ')))
            return
        }
        next(error)
    }
})

router.route('/').post(async (req, res, next) => {
    try {
        const { name, prompt, photo } = createPostSchema.parse(req.body)
        const { secure_url } = await imageService.uploadImage(photo)
        const newPost = await postRepository.create({ name, prompt, photo: secure_url })
        res.status(201).json({ success: true, data: newPost })
    } catch (error) {
        if (error instanceof z.ZodError) {
            next(new AppError(400, error.errors.map(e => e.message).join(', ')))
            return
        }
        next(error)
    }
})

export default router
