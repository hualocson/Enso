import mongoose, {
  InferSchemaType,
  Schema,
} from 'mongoose'

const ItemSchema = new Schema({
  type: {
    type: String,
    enum: ['upload', 'generated'],
    required: true,
    index: true,
  },

  title: {
    type: String,
    trim: true,
  },

  prompt: {
    type: String,
    trim: true,
  },

  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },

  width: {
    type: Number,
    required: true,
    min: 1,
  },

  height: {
    type: Number,
    required: true,
    min: 1,
  },
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

ItemSchema.index({ createdAt: -1 })

export type ItemDocument = InferSchemaType<typeof ItemSchema>

export const ItemModel =
  mongoose.models.Item ||
  mongoose.model('Item', ItemSchema)

export default ItemModel
