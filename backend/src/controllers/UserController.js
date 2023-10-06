const User = require('../models/User')

//import modules
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ObjectId  = require('mongoose').Types.ObjectId

//import middlewares
const createUserToken = require('../middlewares/create-user-token')
const getToken = require('../middlewares/get-token')
const getUserByToken = require('../middlewares/get-user-by-token')

module.exports = class UserController{

    static async register(req, res){
        const { name, email, phone , password, confirmpassword } = req.body

        if(!name){
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        if(!email){
            res.status(422).json({ message: 'O e-mail é obrigatório' })
            return
        }

        //check if user exists
        const userExists = await User.findOne({ email: email })

        if(userExists){
            res.status(422).json({ message: 'O usuário já existe, utilize outro e-mail' })
            return
        }

        if(!phone){
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        if(!password){
            res.status(422).json({ message: 'A senha é obrigatória!' })
            return
        }

        if(!confirmpassword){
            res.status(422).json({ message: 'A confirmação de senha é obrigatória!' })
            return
        }

        if(password != confirmpassword){
            res.status(422).json({ message: 'As senhas não conferem!' })
            return
        }

        const salt = await bcrypt.genSalt(12)
        const hashPassword = await bcrypt.hash(password, salt)

        const user = new User({
            name: name,
            email: email,
            phone: phone,
            password: hashPassword
        })

        try {
            const newUser = await user.save()

            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({ message: error })   
        }
    }

    static async login(req, res){
        const { email, password } = req.body

        if(!email){
            res.status(422).json({ message: 'O e-mail é obrigatorio!' })
            return
        }

        if(!password){
            res.status(422).json({ message: 'A senha é obrigatória!' })
            return
        }

        //check if user exists
        const user = await User.findOne({ email: email })

        if(!user){
            res.status(422).json({ message: 'Usuário não está cadastrado!' })
            return
        }
        
        //check if password match
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({ message: 'Senha incorreta!' })
            return
        }
        
        try {
            await createUserToken(user, req, res)
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }

    static async checkUser(req, res){
        let currentUser

        if(req.headers.authorization){
            const token = getToken(req)
            
            const decoded = jwt.verify(token, 'secretapenasumteste')

            currentUser = await User.findById(decoded.id).select('-password')
        } else {
            currentUser = null
        }    

        res.status(200).json({ currentUser })
    }

    static async getUserById(req, res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        const user = await User.findById(id).select('-password')

        if(!user){
            res.status(422).json({ message: 'Usuário não encontrado!' })
            return
        }

        res.status(200).json({ user })
    }

    static async editUser(req, res){
        const id = req.params.id

        const token = getToken(req)

        const user = await getUserByToken(res, token)
        
        const { name, email, phone, password, confirmpassword } = req.body

        //validations
        if(!ObjectId.isValid(id)){
            res.status(422).json({ message: 'ID Inválido!' })
            return
        }
        
        if(id !== user._id.toString()){
            res.status(422).json({ message: 'Acesso negado!' })
            return
        }

        if(req.file){
            user.image = req.file.filename
        }

        if(!name){
            res.status(422).json({ message: 'O nome é obrigatório' })
            return
        }else {
            user.name = name
        }

        if(!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
        }

        const userExists = await User.findOne({ email: email })

        if(email !== user.email && userExists){
            res.status(422).json({ message: 'Utilize outro e-mail!'})
            return
        } else if(email !== user.email && !userExists){
            user.email = email
        }
        
        if(!phone){
            res.status(422).json({ message: 'O número de telefone é obrigatorio!'})
            return
        } else {
            user.phone = phone
        }

        if(!password){
            res.status(422).json({ message: 'A senha é obrigatória!'})
            return
        }

        if(!confirmpassword){
            res.status(422).json({ message: 'A confirmação de senha é obrigatória!'})
            return
        }

        if(password !== confirmpassword){
            res.status(422).json({ message: 'As senhas não conferem!'})
            return
        } else if(password === confirmpassword && password !== null){
            const salt = await bcrypt.genSalt(12)
            const hashPassword = await bcrypt.hash(password, salt)
            user.password = hashPassword
        }

        try {
            await User.findOneAndUpdate(
                { _id: user._id }, //id do usuario que ser atualizado
                { $set: user }, //qual dado sera atualizado
                { new: true }
            )

            res.status(200).json({ message: 'Usuário atualizado com sucesso!' })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}