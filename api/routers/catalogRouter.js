const express = require('express')
const router = express.Router()
const book_controller = require('../controllers/bookController')

//список книг
router.get('/', book_controller.book_list)

router.get('/:id', book_controller.book_detail)

router.get('/:id/:page', book_controller.book_read)

module.exports = router
