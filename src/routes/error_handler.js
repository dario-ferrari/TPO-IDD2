'use strict'

// Cargamos el módulo de express para poder crear rutas
const express = require('express')
const api = express.Router()

// Controller
const ErrorController = require('../controllers/ErrorController')
const errorController = new ErrorController()

api.get('/', errorController.pageNotFound.bind(errorController))

module.exports = api