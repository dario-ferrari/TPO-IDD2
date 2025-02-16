'use strict'

const redis = require('redis')
const redis_auth = process.env.REDIS_AUTH || null


class RedisConnect {
    #client
    constructor(config) {
        this.config = config
        this.#client = null
    }

    async connect() {
        try {
            this.#client = redis.createClient(this.config)
            if (redis_auth != null) {
                await this.#client.connect()
                await this.#client.auth({password: redis_auth})
            } else {
                await this.#client.connect()
            }
            this.#client.on('error', err => console.log('Redis Server Error', err))
            return true
        } catch(exception) {
            console.log("Class RedisConnect ERROR -> ", exception)
            return false
        }
    }

    getClient() {
        return this.#client
    }

    async disconnect() {
        return await this.#client.disconnect()
    }
}

module.exports = RedisConnect