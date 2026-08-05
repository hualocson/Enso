import express from 'express'
import * as dotenv from 'dotenv'

import { IMAGE_SIZES } from '../lib/imageSizes.js'
import { generateImageSchnell, generateImageDev } from '../services/cloudflare.js'
import { AppError } from '../lib/errors.js'

dotenv.config()

const router = express.Router()

router.route('/').get((req, res) => {
    res.send('hello from dalle route')
})

router.route('/').post(async (req, res, next) => {
    try {
        const { prompt, size } = req.body

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required',
                statusCode: 400,
            })
        }

        const useSchnell = !size || size === 'square'

        if (useSchnell) {
            const photo = await generateImageSchnell(prompt)
            res.status(200).json({ photo })
        } else {
            const dimensions = IMAGE_SIZES[size as keyof typeof IMAGE_SIZES]

            if (!dimensions) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid size "${size}". Supported: ${Object.keys(IMAGE_SIZES).join(', ')}`,
                    statusCode: 400,
                })
            }

            const photo = await generateImageDev(prompt, dimensions)
            res.status(200).json({ photo })
        }
    } catch (error) {
        next(error instanceof AppError ? error : new AppError(500, error instanceof Error ? error.message : 'Something went wrong'))
    }
})

export default router
