const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BookSchema = new Schema({
  title: { type: String, required: true },
  // author: { type: Schema.ObjectId, ref: 'Author', required: true },
  numberOfPages: { type: Number, required: true },
  urlBook: { type: String, required: true },
  added: { type: Date, default: new Date() },
  pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
  description: { type: String, required: false },
  image: { type: Schema.Types.ObjectId, ref: 'Image' },
})

BookSchema.virtual('url').get(function () {
  return '/catalog/' + this._id
})

module.exports = mongoose.model('Book', BookSchema)
