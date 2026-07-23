import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'

import connectDB, { disconnectDB } from './db/connect.js'
import postRoutes from './routes/postRoutes.js'
import dalleRoutes from './routes/dalleRoutes.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use('/api/v1/posts', postRoutes)
app.use('/api/v1/dalle', dalleRoutes)

app.get('/', async (_req, res) => {
    res.send('hello from AI server')
})

app.use(errorHandler)

const PORT = parseInt(process.env.PORT || '8080', 10)

const startServer = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL
        if (!mongoUrl) throw new Error('MONGO_URL environment variable is required')
        await connectDB(mongoUrl)
        const server = app.listen(PORT, () =>
            console.log(`Server is running on http://localhost:${PORT}`),
        )

        const shutdown = async (signal: string) => {
            console.log(`Received ${signal}, shutting down gracefully...`)
            server.close(async () => {
                await disconnectDB()
                process.exit(0)
            })
        }

        process.on('SIGTERM', () => shutdown('SIGTERM'))
        process.on('SIGINT', () => shutdown('SIGINT'))
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
