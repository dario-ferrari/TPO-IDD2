'use strict'

const ErrorNomenclature = require('./../exception/ErrorNomenclature')
const Debugging         = require('./../util/Debugging')
const JwtEncoder        = require('./../util/JwtEncoder')
const AuthException     = require('./../exception/AuthException')

const defaultMessage    = "Not Authorized"
const defaultStatusCode = 401

// Valida autorización por headers.
class AuthMiddleware {

    validator(req, res, next) {

        if (!req.headers.authorization) { //Si no posee autorización por headers se lanza excepción.
            return next(new AuthException(
                defaultMessage,
                defaultStatusCode,
                ErrorNomenclature.withOutAuthorizationHeader(),
                __dirname + ":" + Debugging.getLine()))
        }

        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        /**Verifica JWT: */
        try {
            const result = JwtEncoder.verify(token)
            if (!result) {
                return next(new AuthException(
                    defaultMessage,
                    defaultStatusCode,
                    ErrorNomenclature.authError(),
                    __dirname + ":" + Debugging.getLine()
                ))
            }
            
            res.setHeader('X-Redis', false)

            req.params.groupid = result.usr.group_id//
            req.query.user_id = result.usr.user_id
            req.query.region = result.usr.region
            req.query.token = token
            next()
            
        } catch (error) {
            return res.status(defaultStatusCode).json({ error: defaultMessage })
        }
    }

}

module.exports=AuthMiddleware