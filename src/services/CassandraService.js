'use strict'

const cassandra = require('cassandra-driver')
const config = require('../../config')
const DatabaseException = require('./../exception/DatabaseException')
const ErrorNomenclature = require("../exception/ErrorNomenclature")
const Debugging = require('../util/Debugging')

class CassandraService {
    constructor() {
        this.client = null
        this.isConnected = false
    }

    async connecting() {
        try {
            console.log('Intentando conectar a Cassandra...')
            
            if (!this.client || !this.isConnected) {
                this.client = new cassandra.Client({
                    contactPoints: ['127.0.0.1'],
                    localDataCenter: 'datacenter1',
                    keyspace: 'tienda_idd2',
                    socketOptions: {
                        readTimeout: 12000
                    },
                    policies: {
                        retry: new cassandra.policies.retry.RetryPolicy(),
                        reconnection: new cassandra.policies.reconnection.ExponentialReconnectionPolicy(1000, 60000)
                    },
                    pooling: {
                        coreConnectionsPerHost: {
                            [cassandra.types.distance.local]: 2
                        }
                    }
                })
                
                await this.client.connect()
                this.isConnected = true
                console.log('Conexión a Cassandra establecida exitosamente')
            }
            return true
        } catch (error) {
            console.error('Error detallado conectando a Cassandra:', {
                message: error.message,
                code: error.code,
                info: error.info,
                innerErrors: error.innerErrors
            })
            this.isConnected = false
            throw error
        }
    }

    async execute(query, params = [], options = { prepare: true }) {
        try {
            console.log('Ejecutando query:', query)
            console.log('Parámetros:', params)
            
            await this.connecting()
            const result = await this.client.execute(query, params, options)
            console.log('Resultado de la query:', result.rows)
            return result.rows
        } catch (error) {
            console.error('Error ejecutando query:', error)
            throw error
        }
    }

    async disconnect() {
        try {
            if (this.client && this.isConnected) {
                await this.client.shutdown()
                this.isConnected = false
                console.log('Desconexión de Cassandra exitosa')
            }
        } catch (error) {
            console.error('Error desconectando de Cassandra:', error)
            throw error
        }
    }
}

module.exports = CassandraService