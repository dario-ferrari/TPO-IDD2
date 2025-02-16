'use strict'


class ErrorResponse {

    setInternaCode(internal_code) {
        this.code = internal_code
        return this
    }

    setSource(source) {
        this.source = source
        return this
    }

    setDetail(detail) {
        this.detail = detail
        return this
    }
}

module.exports = ErrorResponse