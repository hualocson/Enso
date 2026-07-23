export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message)
        this.name = this.constructor.name
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message)
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(400, message)
    }
}