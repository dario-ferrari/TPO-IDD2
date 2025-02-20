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
        console.error('Error en middleware:', err);
        
        res.header('Content-Type', 'application/json');
        
        const status = err.status || 500;
        res.status(status).json({
            error: true,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
    
    invalidPathHandler(req, res, next) {
        // En lugar de redirigir, enviamos un error 404
        res.status(404).json({
            error: true,
            message: 'Ruta no encontrada'
        });
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