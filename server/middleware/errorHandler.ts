import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        })
        return
    }

    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            message: 'Invalid ID format',
        })
        return
    }

    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: err.message,
        })
        return
    }

    if ((err as any).code === 11000) {
        res.status(409).json({
            success: false,
            message: 'Duplicate key error',
        })
        return
    }

    console.error('Unhandled error:', err)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    })
}

export default errorHandler