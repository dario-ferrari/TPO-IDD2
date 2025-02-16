'use strict'

class AuthException extends Error {

    /**
     * @param  string  message      Parametro del error del tipo {new Error}
     * @param  string code          status_code Parametro opcional, sino se toma el valor que viene en la excepcion
     * @param  string internal_code Codigo interno de errores de la aplicacion
     * @param  string source        Parametro opcional, sino se toma el valor que viene en la excepcion
     */
    constructor(message, code, internal_code="ERROR-INTERNO-00000", source="src/exception/AppException.js:6") {
        super(message, code)
        this.name          = this.constructor.name
        this.file_line     = source
        this.internal_code = internal_code
        this.statusCode    = code
    }
}

module.exports = AuthException