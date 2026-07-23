import mongoose, { Schema, InferSchemaType } from 'mongoose'

const PostSchema = new Schema({
    name: { type: String, required: true, trim: true, index: true },
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
}, {
    timestamps: true,
    strict: 'throw',
    toJSON: {
        virtuals: true,
        transform(_doc: any, ret: any) {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            return ret
        },
    },
})

PostSchema.index({ createdAt: -1 })

export type PostDocument = InferSchemaType<typeof PostSchema>
export const PostModel = mongoose.model('Post', PostSchema)
export default PostModel
