const jwt = require('jsonwebtoken')

module.exports = async function createUserToken(user, req, res){

    //create a token
    const token = jwt.sign({
        name: user.name,
        id: user._id,
    }, 'secretapenasumteste')

    //return token
    res.status(200).json({ message: 'Você está autenticado!', token })
}
