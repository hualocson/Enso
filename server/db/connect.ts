import mongoose from 'mongoose'

let connectionPromise: Promise<void> | null = null

const connectDB = async (url: string): Promise<void> => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return
    }

    if (connectionPromise) {
        return connectionPromise
    }

    mongoose.set('strictQuery', true)

    connectionPromise = mongoose.connect(url, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    }).then(() => {
        console.log('MongoDB connected')
    }).catch((err) => {
        connectionPromise = null
        throw err
    })

    return connectionPromise
}

export const disconnectDB = async (): Promise<void> => {
    connectionPromise = null
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
}

export default connectDB
