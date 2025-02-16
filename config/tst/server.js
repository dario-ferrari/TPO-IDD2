'use strict'

const path = require('path')

module.exports = {
    env: process.env.NODE_ENV || 'development',
    root: path.normalize(__dirname + '/../..'),
    // Server port
    port: process.env.PORT || 3000,
    // Server IP
    ip: process.env.IP || 'localhost'
}