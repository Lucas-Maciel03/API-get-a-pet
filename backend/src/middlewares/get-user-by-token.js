const User = require('../models/User')
const jwt = require('jsonwebtoken')

const getUserByToken = async (res, token) => {
    if(!token){
        res.status(400).json({ message: 'Acesso negado!' })
        return 
    }

    const decoded = jwt.verify(token, 'secretapenasumteste')

    const user = await User.findById(decoded.id)

    return user
}

module.exports = getUserByToken
