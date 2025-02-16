'use strict'

const ErrorTransform    = require("./../model/error/ErrorTransform")
const ErrorNomenclature = require("./../exception/ErrorNomenclature")
const error_message     = "The URL you are trying to reach does not exist."
const file_line         = './src/controller/ErrorController.js:16'
const status_code       = "404"
const internal_code     = ErrorNomenclature.badRequest()

class ErrorController {

    async pageNotFound(req, res) {
        let errors = []
        errors.push(
            this.#transform({
                message: error_message,
                internal_code: internal_code,
                source: file_line
            })
        )
        errors.push(this.errorResponse)
        res.status(status_code)
        res.json({"errors": errors})
    }

    #transform(input) {
        let errorTransformer = new ErrorTransform()
        return errorTransformer.transform(input)
    }
}

module.exports = ErrorController