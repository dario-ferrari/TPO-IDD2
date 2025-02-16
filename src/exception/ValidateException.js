'use strict'

class ValidateException extends Error {
    constructor(error=[], statusCode = 400) {
        super()
        this.name = this.constructor.name 
        this.errors = error 
        this.statusCode = statusCode
    }
}

module.exports = ValidateException