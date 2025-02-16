'use strict'

//const AuthMiddleware = require('../middleware/AuthMiddleware')
const ServiceController = require('../controllers/ServiceController')
//const ValidatorMiddleware = require('../middleware/ValidatorMiddleware')

const express = require('express')

const api = express.Router()
//const autorizacion=new AuthMiddleware()
const serviceController=new ServiceController()
//const validatorMiddleware=new ValidatorMiddleware()

/**
 * Rutas para consultas a la API con cada uno de los métodos (get, post y delete).
 */
api.get('/prueba', /**autorizacion.validator,**/ async function (req, res, next) {
    //const group_id = req.params.group_id
    console.log("llega hasta acá?");
    serviceController.info(req, res, next/**, group_id**/)
})

api.post('/prueba', /**autorizacion.validator, validatorMiddleware.add,**/ async function (req, res, next) {
    //const group_id = req.params.group_id
    serviceController.new(req, res, next/**, group_id**/)
})

api.delete('/prueba', /**autorizacion.validator, validatorMiddleware.del,**/ async function (req, res, next) {
    //const group_id = req.params.group_id
    serviceController.del(req, res, next/** , group_id**/)
})

module.exports = api