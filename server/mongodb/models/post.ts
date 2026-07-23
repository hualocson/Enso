import mongoose, { Schema } from 'mongoose'

export interface IPost {
    name: string
    prompt: string
    photo: string
}

const PostSchema = new Schema<IPost>({
    name: { type: String, required: true },
    prompt: { type: String, required: true },
    photo: { type: String, required: true },
})

const Post = mongoose.model('Post', PostSchema)
export default Post
