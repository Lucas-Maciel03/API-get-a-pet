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
router.get('/userpets', verifyToken, PetController.getAllUserPets)
router.get('/useradoptions', verifyToken, PetController.getAllUserAdoptions)
router.get('/:id', PetController.getPetById)
router.delete('/:id', verifyToken, PetController.removePetById)
router.patch('/:id', verifyToken, imageUpload.array('images'), PetController.updatePet)
router.patch('/schedule/:id', verifyToken, PetController.schedule)
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption)

module.exports = router
