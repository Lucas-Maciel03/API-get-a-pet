const express = require('express')
const router = express.Router()

//import pet controller
const PetController = require('../controllers/PetController')

//import middleware
const verifyToken = require('../middlewares/verify-token')
const { imageUpload } = require('../middlewares/image-upload')

router.post(
    '/create',
    verifyToken,
    imageUpload.array('images'),
    PetController.create
)
router.get('/', PetController.getPet)

module.exports = router