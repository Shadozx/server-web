const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthorSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  surname: { type: String, required: true, maxlength: 100 },
})

AuthorSchema.virtual('fullname').get(function () {
  return this.name + ' ' + this.surname
})

module.exports = mongoose.model('Author', AuthorSchema)
