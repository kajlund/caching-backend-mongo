import mongoose from 'mongoose'

const Schema = mongoose.Schema
const commentSchema = new Schema(
  {
    comment: {
      type: String,
      trim: true,
    },
    cache: {
      type: Schema.Types.ObjectId,
      ref: 'Cache',
      required: [true, 'A comment must belong to a cache'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A comment must belong to a user'],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Comment', commentSchema)
