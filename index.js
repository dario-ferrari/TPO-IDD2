'use strict'

const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
//const newRelic = require('newrelic') //Módulo para monitorización y seguimiento.

const errorMiddleware = require('./src/middleware/ErrorMiddleware') //componente middleware para el manejo de errores
const app = express()
const prueba = require('./src/routes/prueba')
const error_handler = require('./src/routes/error_handler')
const auth = require('./src/routes/auth')
const products = require('./src/routes/products')
const users = require('./src/routes/users')
const cart = require('./src/routes/cart')
const bills = require('./src/routes/bills')

// Primero CORS
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Permitir ambos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Luego body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/**Rutas:*/
app.use('/service', prueba)
app.use('/service/auth', auth)
app.use('/service/products', products)
app.use('/users', users)
app.use('/service/cart', cart)
app.use('/bills', bills)
app.use('/service/error', error_handler)

app.use(errorMiddleware.errorResponder)
app.use(errorMiddleware.invalidPathHandler)

//Servidor web con NodeJS
const port = 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
}).on('error', (err) => {
    console.error('Error starting server:', err);
});

module.exports = app