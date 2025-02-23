'use strict'

const config=require('./config')

const express=require('express') //Módulo para manejo de rutas, errores, middleware, servidores web.
const bodyParser=require('body-parser') //Módulo para análisis de cuerpo de solicitudes http.
//const newRelic=require('newrelic') //Módulo para monitorización y seguimiento.

const errorMiddleware = require('./src/middleware/ErrorMiddleware') //componente middleware para el manejo de errores
const app=express()
const prueba = require('./src/routes/prueba')
const error_handler = require('./src/routes/error_handler')
const auth = require('./src/routes/auth')
const user = require('./src/routes/user')
const cart = require("./src/routes/cart");
const order = require("./src/routes/order");
const billing = require("./src/routes/billing");
const operationLog = require("./src/routes/operationLogs");

app.use(bodyParser.urlencoded({extended:true})) //análisis de datos codificados en url
app.use(bodyParser.json())

/**Rutas:*/
app.use('/service', prueba)
app.use('/service', auth)
app.use('/service', user)
app.use("/cart", cart);
app.use("/order", order);
app.use("/billing", billing);
app.use("/logs", operationLog);
app.use('/service/error', error_handler)

app.use(errorMiddleware.errorResponder)
app.use(errorMiddleware.invalidPathHandler)

//Servidor web con NodeJS
app.listen(config.server.port, () => {
    console.log("servidor corriendo en http://" + config.server.ip + ":" + config.server.port + "/service")
})