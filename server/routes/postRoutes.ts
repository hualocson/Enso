import express from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'
import { postRepository } from '../repositories/post.repository.js'
import { AppError } from '../lib/errors.js'

const router = express.Router()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
        const photoUrl = await cloudinary.uploader.upload(photo)
        const newPost = await postRepository.create({ name, prompt, photo: photoUrl.url })
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
