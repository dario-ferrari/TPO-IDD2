'use strict'

let allConfig = new Object()

// Common Config
allConfig.jwt = require('./common/jwt')

// Environment config
let env = process.env.NODE_ENV || 'development'
if (env == "test") {
    env = "development"
}
allConfig.environment = env
allConfig.server = require("./" + env + "/server")
allConfig.redis = require("./"+ env + "/redis")
allConfig.cassandra = require("./"+ env +"/cassandra")
allConfig.mongodb = require("./"+ env +"/mongodb")

module.exports = allConfig