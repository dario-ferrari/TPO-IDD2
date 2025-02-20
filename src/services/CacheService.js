'use strict'

const Redis = require('ioredis')
const config = require('../../config')
const DatabaseException = require('../exception/DatabaseException')
const ErrorNomenclature = require('../exception/ErrorNomenclature')
const Debugging = require('../util/Debugging')

class CacheService {
    constructor() {
        this.client = null
    }

    async connect() {
        if (!this.client) {
            this.client = new Redis({
                ...config.redis,
                db: 0 // Usar base de datos 0 para sesiones
            })
            
            this.client.on('error', (err) => console.error('Redis Session Error:', err))
            await this.client.select(0)
            console.log('Conectado a Redis DB 0 (Sesiones)')
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit()
            this.client = null
        }
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

    keyGenerator(array, separator) {
        return array.join(separator)
    }
}

module.exports = CacheService