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
            available: available,
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

    static async getAllUserPets(req, res){
        //get user
        const token = getToken(req)
        const user = await getUserByToken(res, token)
        
        //get all user pets
        let pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')
        
        if(pets.length === 0){
            res.status(404).json({ message: 'Você não tem nenhum pet cadastrado!' })
            return
        }

        res.status(200).json({ pets })
    }

    static async getAllUserAdoptions(req, res){
        const token = getToken(req)
        const user = await getUserByToken(res, token)

        const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')

        if(pets.length === 0){
            res.status(404).json({ message: 'Você não adotou nenhum pet!' })
            return
        }

        res.status(200).json({ pets })
    }

    static async getPetById(req, res){
        const id = req.params.id   

        //check if id is valid
        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido' })
            return
        }

        //get pet by id
        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        res.status(200).json({ pet })
    }

    static async removePetById(req, res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido' })
            return
        }
        
        //get pet by id
        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(res, token)

        if(user._id.toString() !== pet.user._id.toString()){
            res.status(422).json({ message: 'Houve um problema ao tentar realizar sua solicitação, tente novamente mais tarde!' })
            return
        }

        await Pet.findByIdAndRemove(id)

        res.status(200).json({ message: 'Pet removido com sucesso!' })        
    }

    static async updatePet(req, res){
        const id = req.params.id

        const { name, age, weight, color, available } = req.body
        const images = req.files

        const updatedPet = {}

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        //check if pet exists
        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        //check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(res, token)

        if(user._id.toString() !== pet.user._id.toString()){
            res.status(422).json({ message: 'Você não tem permissao!' })
            return
        }

        //validations
        if(!name){
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        } else{
            updatedPet.name = name
        }
        
        if(!age){
            res.status(422).json({ message: 'A idade é obrigatória!' })
            return
        } else{
            updatedPet.age = age
        }

        if(!weight){
            res.status(422).json({ message: 'A peso é obrigatório!' })
            return
        } else{
            updatedPet.weight = weight
        }

        if(!color){
            res.status(422).json({ message: 'A cor é obrigatória!' })
            return
        } else{
            updatedPet.color = color
        }

        if(images.length === 0){
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
        } else{
            updatedPet.images = []
            images.map((image) => {
                updatedPet.images.push(image.filename)
            })
        }

        try {
            await Pet.findByIdAndUpdate(id, updatedPet)
            res.status(200).json({ message: 'Pet atualizado com sucesso!' })
            
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    static async schedule(req, res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        //check if pet exists
        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }
        
        //check if user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(res, token)
        
        if(pet.user._id.equals(user._id)){
            res.status(422).json({ message: 'Você não pode adotar seu próprio pet!' })
            return
        }

        //check if user has already schedule the visit
        if(pet.adopter){
            if(pet.adopter._id.equals(user._id)){
                res.status(422).json({ message: 'Você já agendou uma visita para esse pet!' })
                return
            }
        }

        try{
            //add user to pet
            pet.adopter = {
                _id: user._id,
                name: user.name,
                image: user.image
            }

            await Pet.findByIdAndUpdate(id, pet)

            res.status(200).json({ message: `Visita agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}` })
        } catch(error){
            res.status(500).json({ message: error })
        }
    }

    static async concludeAdoption(req, res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        //check if pet exists
        const pet = await Pet.findById(id)

        if(!pet){
            res.status(404).json({ message: 'Pet não encontrado!' })
            return
        }

        //check if pet has already been adopted
        if(pet.available === false){
            res.status(422).json({ message: 'Esse pet já foi Adotado!' })
            return
        }

        //check if user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(res, token)
        
        if(pet.user._id.toString() !== user._id.toString()){
            res.status(401).json({ message: 'Você não tem permissão para realizar essa ação!' })
            return
        }

        //check if user has already schedule the visit
        if(!pet.adopter){
            res.status(422).json({ message: 'Esse pet não pode ser adotado, pois não tem nenhum adotante agendado!' })
            return
        }

        try {
            pet.available = false

            await Pet.findByIdAndUpdate(id, pet)

            res.status(200).json({ message: 'Parabéns! O ciclo de adoção foi concluido com sucesso!' })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}
