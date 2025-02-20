'use strict'

const ErrorNomenclature = require('./../exception/ErrorNomenclature')
const Debugging         = require('./../util/Debugging')
const JwtEncoder        = require('./../util/JwtEncoder')
const AuthException     = require('./../exception/AuthException')
const jwt               = require('jsonwebtoken')
const config            = require('../../config')

const defaultMessage    = "Not Authorized"
const defaultStatusCode = 401

// Valida autorización por headers.
class AuthMiddleware {

    verifyToken(req, res, next) {
        try {
            const bearerHeader = req.headers['authorization']
            
            if (!bearerHeader) {
                return res.status(401).json({ error: 'Token no proporcionado' })
            }

            const token = bearerHeader.split(' ')[1]
            const decoded = jwt.verify(token, config.jwt.secret)
            
            if (!decoded.userId) {
                return res.status(401).json({ error: 'Token inválido - no contiene userId' })
            }

            // Agregar información del usuario decodificada a la request
            req.user = decoded
            console.log('Usuario autenticado:', decoded)
            next()
        } catch (error) {
            console.error('Error en verificación de token:', error)
            return res.status(401).json({ error: 'Token inválido' })
        }
    }

}

module.exports = new AuthMiddleware()