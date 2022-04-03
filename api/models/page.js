const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PageSchema = new Schema({
  title: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  textPage: String,
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
})

PageSchema.virtual('url').get(function () {
  return '/catalog/' + this.book + '/' + this.pageNumber
})
module.exports = mongoose.model('Page', PageSchema)
