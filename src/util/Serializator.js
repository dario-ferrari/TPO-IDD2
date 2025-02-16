'use strict'


class Serializator {

    static serialize(object) {
        return JSON.stringify(object)
    }

    static deserialize(string) {
        return JSON.parse(string)
    }
}

module.exports = Serializator