import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'

import connectDB from './mongodb/connect.js'
import postRoutes from './routes/postRoutes.js'
import dalleRoutes from './routes/dalleRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/api/v1/posts', postRoutes)
app.use('/api/v1/dalle', dalleRoutes)

app.get('/', async (req, res) => {
    res.send('hello from AI server')
})

const startServer = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL
        if (!mongoUrl) throw new Error('MONGO_URL environment variable is required')
        await connectDB(mongoUrl)
        app.listen(8080, () =>
            console.log('Server is running on http://localhost:8080'),
        )
    } catch (error) {
        console.error('Failed to start server:', error)
    }
}

startServer()
