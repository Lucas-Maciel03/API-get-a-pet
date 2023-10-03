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
            res.status(422).json({ message: 'O usuario ja existe, utilize outro e-mail' })
            return
        }

        if(!phone){
            res.status(422).json({ message: 'O telefone é obrigatório' })
            return
        }

        if(!password){
            res.status(422).json({ message: 'A senha é obrigatoria!' })
            return
        }

        if(!confirmpassword){
            res.status(422).json({ message: 'A confirmação de senha é obrigatoria!' })
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
}