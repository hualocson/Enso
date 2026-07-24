import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    const statusCode = err instanceof AppError ? err.statusCode : 500

    if (err instanceof AppError) {
        res.status(statusCode).json({
            success: false,
            message: err.message,
            statusCode,
        })
        return
    }

    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            statusCode: 400,
        })
        return
    }

    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: err.message,
            statusCode: 400,
        })
        return
    }

    if ((err as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Duplicate key error',
            statusCode: 409,
        })
        return
    }

    console.error('Unhandled error:', err)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        statusCode: 500,
    })
}

export default errorHandler