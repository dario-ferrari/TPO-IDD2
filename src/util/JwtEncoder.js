'use strict'

const jsonwebtoken = require("jsonwebtoken")
const config = require("./../../config")


class JwtEncoder {
    static encode(object) {
        return jsonwebtoken.sign(object, config.jwt.secret)
    }

    static verify(string) {
        try {
            return jsonwebtoken.verify(string, config.jwt.secret)
        } catch (exception) {
            return false
        }
    }
}

module.exports = JwtEncoder