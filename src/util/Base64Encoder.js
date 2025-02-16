'use strict'


class Base64Encoder {
    static encode(string) {
        let b2 = Buffer.from(string)
        return b2.toString('base64')
    }

    static decode(string) {
        return "DECODED"
    }
}

module.exports = Base64Encoder