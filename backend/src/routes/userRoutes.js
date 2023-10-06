const express = require('express')
const router = express.Router()

const UserController = require('../controllers/UserController')

//middlewares
const verifyToken = require('../middlewares/verify-token')
const { imageUpload } = require('../middlewares/image-upload')

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/checkuser', UserController.checkUser)
router.get('/:id', UserController.getUserById)
router.patch(
    '/edit/:id',
    verifyToken,
    imageUpload.single('image'), 
    UserController.editUser
)

module.exports = router
