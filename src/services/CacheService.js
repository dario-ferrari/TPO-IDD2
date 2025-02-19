'use strict'

const RedisConnect = require('./../repository/redis/RedisConnect')

class CacheService {
    /**
     * @param {*} config Es la config que viene por RO o por RW de REDIS 
     */
    constructor(config, expire, dbIndex = 0) {
        this.config = config
        this.expire = expire || null
        this.is_alive = true
        this.dbIndex = dbIndex
    }

    async connect() {
        this.redis = new RedisConnect(this.config.string_connect)
        this.is_alive = await this.redis.connect()
        this.client = this.redis.getClient()
        await this.client.select(this.dbIndex)
    }

    isReady() {
        return this.is_alive
    }

    //Obtiene registro de Redis
    async get(key) {
        await this.connect()
        if (!this.is_alive) {
            return null
        }
        const result = await this.client.get(key)
        await this.disconnect()
        return result
    }

    //Agrega llave-valor a Redis
    async set(key, value) {
        await this.connect()
        if (!this.is_alive) {
            return null
        }
        await this.client.set(key, value)
        await this.client.expire(key, this.expire)
        await this.disconnect()
        return true
    }

    //Elimina de Redis usando key
    async del(key) {
        await this.connect()
        if (!this.is_alive) {
            return null
        }
        await this.client.del(key)
        await this.disconnect()
        return true
    }

    //Establece desconexión de db
    async disconnect() {
        if (this.is_alive) {
            await this.client.disconnect()
            return true
        }
        return false
    }


    keyGenerator(array, separator) {
        return array.join(separator)
    }
}

module.exports = CacheService