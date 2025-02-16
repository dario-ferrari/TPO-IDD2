'use strict'

const Repository = require('../repository/ServiceRepository')
const Serializator = require('./../util/Serializator')
const CacheService = require('./CacheService')
const config = require('../../config')
const ErrorNomenclature = require('../exception/ErrorNomenclature')
const AppException = require('../exception/AppException')
const Debugging = require('../util/Debugging')

class PruebaService{

    #type = "key_prueba_redis" //nombre para la clave de Redis

    async init() {
        this.repository = new Repository()
        this.cacheRwManager = new CacheService(config.redis.rw, config.redis.ttl) //Servicio de Redis
        this.cacheRoManager = new CacheService(config.redis.ro) //Servicio de Redis
    }

    /**
     * Método para obtener datos de Redis o Cassandra, dependiendo de si se trajo información de Redis.
     */
    async getByUserId(req) {

        let key  = this.cacheRoManager.keyGenerator([req.query.user_id, req.query.region, this.#type], config.redis.key_separator) //Genera clave redis con user_id y region.

        let result = await this.cacheRoManager.get(key) //Método para obtener valor de key de Redis

        let dataRedis = false //Variable para header interno, chequea si se trajo información de Redis.
        
        if (result !== null) { //Si Redis tiene los datos, se devuelven como respuesta
            dataRedis = true
            return this.transform(Serializator.deserialize(result), req.query.user_id, dataRedis)
        }

        /**Se realiza consulta a Cassandra en caso de que no estén los datos en caché:*/
        result = await this.repository.findByUserId(req.query.user_id)
        if (result === null) {
            throw new AppException('Content data doesnt exist for user', 400, ErrorNomenclature.nonExistingUser(),  __dirname + ":" + Debugging.getLine())
        }

        let data = Serializator.serialize({user_id: result.user_id, producto_id: result.producto_id, time: result.time}) //Lo convierto a JSON
        this.cacheRwManager.set(key, data) //Se guarda en Redis

        return this.transform(Serializator.deserialize(data, group_id), req.query.user_id, dataRedis)

    }

    /**
     * Antes de crear un registro, busca en Redis y Cassandra si ya existe una interacción del usuario con ese contenido; en caso de que no exista, se crea el
     * nuevo registro. En caso que sí exista, va a eliminar o actualizar el registro dependiendo de la interacción.
     * @param {*} req 
     * @returns 
     */
    async setOne(req) {

        let body = req.body //Body en caso de que se pasen parámetros por body
        let key  = this.cacheRoManager.keyGenerator([req.query.user_id, req.query.region, this.#type], config.redis.key_separator)//clave redis
        //let result = await this.repository.findByUserId(req.query.user_id)
        let serialized = null

        serialized = Serializator.serialize({user_id: req.query.user_id, region: req.query.region, time: new Date()})//MODIFICAR para pasar los parámetros que se requieran persistir en Redis.

        await this.repository.insertOne(new Date(), req.query.user_id, req.query.region )//MODIFICAR para pasar los parámetros que se requieran persistir en Cassandra.
        await this.cacheRwManager.set(key, serialized)
        return this.transform(req.body, req.query.user_id)
        
    }

    async delOne(req) {

        let key = this.cacheRoManager.keyGenerator([req.query.user_id, req.query.region, this.#type], config.redis.key_separator)

        let result = await this.repository.findByUserId(req.query.user_id)
        if (result!==null) {
            await this.repository.deleteOne(req.query.user_id)
            await this.cacheRwManager.del(key)
            return this.transform(result, req.query.user_id)
        } else {
            throw new AppException("User data doesn't exist", 400, ErrorNomenclature.nonExistingUser(), __dirname + ":" + Debugging.getLine())
        }
    }

    merge(target) {
        let sources = [].slice.call(arguments, 1)
        sources.forEach(function (source) {
            for (let prop in source) {
                target[prop] = source[prop]
            }
        })
        return target
    }
    
    transform(input, userId, dataRedis) {
        
        let redisInfo = dataRedis
        return {
            data: {
                data: {
                    abc: true,
                    time: ((input.time==null) || (input.time==0)) ? new Date() : input.time,
                    userId: userId,
                }
            }, 
            redisInfo
        }
    }

}

module.exports=PruebaService