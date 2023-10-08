const Pet = require('../models/Pet')

//import modules
const ObjectId  = require('mongoose').Types.ObjectId

//import middlewares
const getToken = require('../middlewares/get-token')
const getUserByToken = require('../middlewares/get-user-by-token')

module.exports = class PetController{
    static async create(req, res){
        const { name, age, weight, color } = req.body
        const available = true
        const images = req.files

        //validations
        if(!name){
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }
        
        if(!age){
            res.status(422).json({ message: 'A idade é obrigatória!' })
            return
        }

        if(!weight){
            res.status(422).json({ message: 'A peso é obrigatório!' })
            return
        }

        if(!color){
            res.status(422).json({ message: 'A cor é obrigatória!' })
            return
        }

        if(images.length === 0){
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
        }

        //get user owner
        const token = getToken(req)
        const user = await getUserByToken(res, token)
        
        const pet = new Pet({
            name: name,
            age: age,
            weight: weight,
            color: color,
            images: [],
            user:{
                name: user.name,
                _id: user._id,
                image: user.image,
                phone: user.phone
            }
        })

        images.map((image) => {
            pet.images.push(image.filename) 
            /*recebe um array de objetos com varios dados da imagem
            e vai salvar no array o nome das imagens*/
        })

        try {
            const newPet = await pet.save()

            res.status(201).json({ message: 'Pet cadastrado com sucesso!', newPet })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    static async getPet(req, res){
        const pets = await Pet.find().sort('-createdAt')
        
        res.status(200).json({ pets })
    }
}