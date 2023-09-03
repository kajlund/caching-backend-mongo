import mongoose from 'mongoose'

const ROLES = ['ADMIN', 'PROSPECT', 'USER']

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a name between 3 and 50 characters'],
      maxlength: 50,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password. Min 8 chars'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'PROSPECT',
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', UserSchema)
