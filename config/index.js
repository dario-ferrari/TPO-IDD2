'use strict'

let allConfig = new Object()

// Common Config

// Environment config
let env = process.env.NODE_ENV || 'development'
if (env == "test") {
    env = "development"
}
allConfig.environment = env
allConfig.server = require("./" + env + "/server")
allConfig.redis = require("./"+ env + "/redis")
allConfig.cassandra = require("./"+ env +"/cassandra")

module.exports = allConfig