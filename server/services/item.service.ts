import fs from 'node:fs/promises'
import type {
  ListItemsParams,
  PaginatedResult,
  CreateItemData
} from '../repositories/item.repository.js'
import type {
  ItemDocument,
} from "../mongodb/models/item.js"

import { imageService } from "./image.service.js"

import {
  ItemRepository,
  itemRepository,
} from '../repositories/item.repository.js'


export interface CreateUploadedFileInput {
  file: Express.Multer.File
  title?: string
}

export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
  ) { }

  async list(
    params: ListItemsParams = {
      page: 1,
      limit: 24
    },
  ): Promise<PaginatedResult<ItemDocument>> {
    return this.itemRepository.list(params)
  }

  async create(
    data: CreateItemData,
  ): Promise<ItemDocument> {
    return this.itemRepository.create(data)
  }


  async createUploadedFile(
    input: CreateUploadedFileInput,
  ): Promise<ItemDocument> {
    const { file, title } = input
    let publicId: string | undefined


    try {
      const uploaded = await imageService.uploadImageFile(file.path)

      return await this.itemRepository.create({
        type: 'upload',
        title,
        imageUrl: uploaded.secure_url,
        width: uploaded.width,
        height: uploaded.height,
      })
    } catch (error) {
      if (publicId) {
        await imageService.deleteImage(publicId).catch(() => { })
      }
      throw error
    } finally {
      // Remove temporary file after Cloudinary upload
      await fs.unlink(file.path).catch(() => { })
    }
  }
}

export const itemService = new ItemService(
  itemRepository,
)
