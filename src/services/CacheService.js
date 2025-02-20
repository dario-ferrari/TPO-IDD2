'use strict'

const RedisConnect = require('../repository/redis/RedisConnect')
const { createClient } = require('redis')
const DatabaseException = require('../exception/DatabaseException')
const ErrorNomenclature = require('../exception/ErrorNomenclature')
const Debugging = require('../util/Debugging')

class CacheService {
    /**
     * @param {*} config Es la config que viene por RO o por RW de REDIS 
     */
    constructor(config, prefix = '', db = 0) {
        this.config = config
        this.prefix = prefix
        this.db = db  // Número de base de datos
        this.is_alive = true
        this.client = null
    }

    async connect() {
        if (!this.client) {
            this.client = createClient({
                ...this.config,
                database: this.db  // Especifica la base de datos
            })
            await this.client.connect()
        }
    }

    isReady() {
        return this.is_alive
    }

    //Obtiene registro de Redis
    async get(key) {
        try {
            await this.connect()
            const result = await this.client.get(key)
            return result
        } catch (error) {
            throw new DatabaseException(error.message, 500, ErrorNomenclature.errorRedis(), __dirname + ":" + Debugging.getLine())
        }
    }

    //Agrega llave-valor a Redis
    async set(key, value, expireTime = null) {
        try {
            await this.connect()
            await this.client.set(key, value)
            if (expireTime) {
                await this.client.expire(key, parseInt(expireTime))
            }
            return true
        } catch (error) {
            throw new DatabaseException(error.message, 500, ErrorNomenclature.errorRedis(), __dirname + ":" + Debugging.getLine())
        }
    }

    //Elimina de Redis usando key
    async del(key) {
        try {
            await this.connect()
            await this.client.del(key)
            return true
        } catch (error) {
            throw new DatabaseException(error.message, 500, ErrorNomenclature.errorRedis(), __dirname + ":" + Debugging.getLine())
        }
    }

    //Establece desconexión de db
    async disconnect() {
        if (this.client && this.client.isOpen) {
            await this.client.disconnect()
            this.client = null
        }
        return true
    }


    keyGenerator(array, separator) {
        return array.join(separator)
    }
}

module.exports = CacheService