'use strict'

const ErrorNomenclature = require("../exception/ErrorNomenclature")
const ErrorTransform    = require("./../model/error/ErrorTransform")
const Debugging         = require('../util/Debugging')

class ErrorMiddleware {
    errorColorLogger(err, req, res, next) {
        console.error('\x1b[31m', err) //registra errores en consola con color rojo.
        next(err) //pasa error al siguiente middleware
    }
      
    errorResponder(err, req, res, next) {
        let statusCode = err.statusCode || 500//status http para la respuesta
        console.error('class: ERROR MIDDLEWARE - Method: ERROR_Responder - Details -> ', err)
        if (typeof err.errors === "undefined") { //si no tiene propiedad "errors" agrega info de error predeterminada
            err = internalError(err)
            let errors = []
            errors.push(
                transform({
                    message:       err.message,
                    code: err.internal_code || ErrorNomenclature.unknownError(),
                    source:        err.file_line || __dirname + ":" + Debugging.getLine()
                })
            )
            err.errors = errors
        }
        res.status(statusCode || 404).json({'errors': err.errors})//responde json con información del error
    }
    
    invalidPathHandler(req, res, next) {
        res.status(404).json({ error: "Invalid path" })
    }
}

function internalError(err) {
    let result = err
    if (err.type === "entity.parse.failed") {
        result.message = "Structure error in json body"
        result.internalError = ErrorNomenclature.jsonBodyError()
        result.source = __dirname + ":" + Debugging.getLine()
    }
    return result
}

function transform(input) {
    let errorTransformer = new ErrorTransform()
    return errorTransformer.transform(input)
}



module.exports = new ErrorMiddleware()