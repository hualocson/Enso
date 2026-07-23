import express from 'express'
import * as dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

router.route('/').get((req, res) => {
    res.send('hello from dalle route')
})

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.CF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    steps: 4,
                }),
            }
        )

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody.errors?.[0]?.message || `Cloudflare API returned ${response.status}`);
        }

        const data = await response.json() as { result: { image: string } }
        res.status(200).json({ photo: data.result.image })
    } catch (error) {
        console.log(error)
        res.status(500).send(
            error instanceof Error ? error.message : 'Something went wrong',
        )
    }
})

export default router
