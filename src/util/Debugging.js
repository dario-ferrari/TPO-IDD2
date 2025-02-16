'use strict'

const path = require('path')

class Debugging {
    static getLine() {
        let e = new Error()
        let frame = e.stack.split("\n")[2] // change to 3 for grandparent func
        return frame.split(":").reverse()[1]
    }
}

module.exports = Debugging