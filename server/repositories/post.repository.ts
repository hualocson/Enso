import PostModel, { PostDocument } from '../mongodb/models/post.js'

export interface ListPostsParams {
    page?: number
    limit?: number
}

export interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

const toPlainObject = (doc: Record<string, unknown>): PostDocument => {
    const { _id, __v, ...rest } = doc
    return { id: String(_id), ...rest } as unknown as PostDocument
}

export class PostRepository {
    async list(params: ListPostsParams = {}): Promise<PaginatedResult<PostDocument>> {
        const page = Math.max(1, params.page ?? 1)
        const limit = Math.min(100, Math.max(1, params.limit ?? 20))
        const skip = (page - 1) * limit

        const [data, total] = await Promise.all([
            PostModel
                .find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('name prompt photo createdAt')
                .lean(),
            PostModel.countDocuments({}),
        ])

        return {
            data: data.map(toPlainObject),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }

    async create(data: { name: string; prompt: string; photo: string }): Promise<PostDocument> {
        const doc = await PostModel.create(data)
        return doc.toJSON() as unknown as PostDocument
    }
}

export const postRepository = new PostRepository()
