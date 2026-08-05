/**
 * Handle Mongodb for item schema
 */

import ItemModel, { ItemDocument } from '../mongodb/models/item.js'

export interface ListItemsParams {
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


export interface CreateItemData {
  type: ItemDocument['type']
  title?: string
  prompt?: string
  imageUrl: string
  width: number
  height: number
}



const toPlainObject = (
  doc: Record<string, unknown>,
): ItemDocument => {
  const { _id, __v, ...rest } = doc

  return {
    id: String(_id),
    ...rest,
  } as unknown as ItemDocument
}

export class ItemRepository {
  async list(
    params: ListItemsParams = {},
  ): Promise<PaginatedResult<ItemDocument>> {
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.min(100, Math.max(1, params.limit ?? 20))
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      ItemModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'type title prompt imageUrl width height createdAt updatedAt',
        )
        .lean(),

      ItemModel.countDocuments({}),
    ])

    return {
      data: data.map(toPlainObject),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async create(data: CreateItemData): Promise<ItemDocument> {
    const doc = await ItemModel.create(data)

    return doc.toJSON() as unknown as ItemDocument
  }

}

export const itemRepository = new ItemRepository()
