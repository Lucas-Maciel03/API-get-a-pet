const jwt = require('jsonwebtoken')
const getToken = require('./get-token')

module.exports = function verifyToken(req, res, next){

    if(!req.headers.authorization){
        res.status(401).json({ message: 'Acesso negado!' })
        return
    }

    const token = getToken(req) 

    if(!token){
        res.status(401).json({ message: 'Acesso negado!' })
        return
    }

    try {
        const decoded = jwt.verify(token, 'secretapenasumteste')
        res.user = decoded
        next()

    } catch (error) {
        res.status(400).json({ message: 'Token Inválido' })
    }
}
