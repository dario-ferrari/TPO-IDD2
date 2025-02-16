'use strict'

const ErrorResponse = require("./ErrorResponse")
const Base64Decoder = require("./../../util/Base64Encoder")

class ErrorTransform {
    
    #errorResponse() {
        return new ErrorResponse()
    }

    /**
     * [transform description]
     * @param  {message: string, code: string, source: string} input Objecto que contiene informacion del Error
     * @return ErrorResponse response Retorna un modelo de error preestablecido
     */
    transform(input) {
        let response = this.#errorResponse()
        response.setInternaCode(input.code)
            .setDetail(input.message)
            .setSource(Base64Decoder.encode(input.source))
        return response
    }
    
}

module.exports = ErrorTransform