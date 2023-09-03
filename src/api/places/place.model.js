import mongoose from 'mongoose'

const PlaceSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      min: [1, `The value of path {PATH} ({VALUE}) is beneath the limit ({MIN}).`],
      max: [1999, `The value of path {PATH} ({VALUE}) exceeds the limit ({MAX}).`],
    },
    nameSv: {
      type: String,
      required: [true, 'nameSv must between 2 and 200 characters'],
      maxlength: 200,
      minlength: 2,
    },
    nameFi: {
      type: String,
      required: [true, 'NameFi must be between 2 and 200 characters'],
      maxlength: 200,
      minlength: 2,
    },
    provinceSv: {
      type: String,
      required: [true, 'Field provinceSv must be between 2 and 200 characters'],
      maxlength: 200,
      minlength: 2,
    },
    provinceFi: {
      type: String,
      required: [true, 'Field provinceFi must be between 2 and 200 characters'],
      maxlength: 200,
      minlength: 2,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Place', PlaceSchema)
