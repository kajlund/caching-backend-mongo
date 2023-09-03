import mongoose from 'mongoose'

import Place from '../places/place.model.js'
import User from '../users/user.model.js'
import Comment from '../comments/comment.model.js'

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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: Comment,
      },
    ],
    place: {
      type: Schema.Types.ObjectId,
      ref: Place,
    },
    user: {
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
