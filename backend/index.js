const express = require('express')
const conn = require('./src/db/conn')

const app = express()

//public
app.use(express.static('public'))

//config json response
app.use(express.json())

//routes
const userRoutes = require('./src/routes/')

app.use('/users', userRoutes)
app.use('/pets')

app.listen(3000, () => console.log('Listen in port 3000'))