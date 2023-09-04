import mongoose from 'mongoose'

import Place from '../places/place.model.js'
import User from '../users/user.model.js'

const Schema = mongoose.Schema

export const CACHETYPES = [
  'Traditional',
  'Mystery',
  'Multi',
  'Earth',
  'Letterbox',
  'Event',
  'CITO',
  'Mega',
  'Giga',
  'Wherigo',
  'HQ',
  'Lab',
  'Virtual',
  'Webcam',
]

const commentSchema = new Schema({
  comment: {
    type: String,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: [true, 'A comment must belong to a user'],
  },
})

const cacheSchema = new Schema(
  {
    gc: {
      type: String,
      required: [true, 'A geocache must have a GC-code'],
      trim: true,
      unique: [true, 'A geocache must have a unique GC-code'],
    },
    cacheType: {
      type: String,
      enum: CACHETYPES,
      required: [true, 'A geocache must have a type'],
      indexed: true,
    },
    name: {
      type: String,
      required: [true, 'A geocache must have a name'],
      trim: true,
    },
    coords: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    comments: [commentSchema],
    placeId: {
      type: Schema.Types.ObjectId,
      ref: Place,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Cache', cacheSchema)
