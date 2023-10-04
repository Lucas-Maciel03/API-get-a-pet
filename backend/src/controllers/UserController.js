const User = require('../models/User')

//import modules
const bcrypt = require('bcrypt')

//import middlewares
const createUserToken = require('../middlewares/create-user-token')

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
            await createUserToken(checkUser, req, res)
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}