const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ImageSchema = new Schema({
  contentType: String,
  data: { type: Buffer, required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  filename: { type: String, required: true },
  url: { type: String, required: true },
})

// ImageSchema.virtual('url').get(function () {
//   return '/api/images/' + filename
// })

module.exports = mongoose.model('Image', ImageSchema)
