'use strict'

const ErrorNomenclature = require('../exception/ErrorNomenclature')
const Debugging = require('../util/Debugging')
const config = require('../../config')
const DatabaseException = require('../exception/DatabaseException')
const CassandraConnect = require('./cassandra/CassandraConnect')

/**
 * Clase para manejar las consultas a Cassandra
 */
class ServiceRepository {

    /**
     * En estas consultas, estoy pasando "tpo" como keyspace, y "tabla_cassandra" como tabla. Modificar las consultas.
     */

    queryFind = "SELECT * FROM tpo.tabla_cassandra WHERE user_id = ?"
    queryInsert = "INSERT INTO tpo.tabla_cassandra (time , user_id, region) VALUES (?, ?, ?)"
    queryUpdate = "UPDATE tpo.tabla_cassandra SET time = ?, parametroA = ?, parametroB = ? WHERE user_id = ?"
    queryDelete = "DELETE FROM tpo.tabla_cassandra WHERE user_id = ? "

    constructor() {
        this.cassandra = new CassandraConnect(config.cassandra)
    }

    /**
     * Busca en la tabla de Cassandra si existe un registro por los parametros pasados. Por id de usuario.
     */
    async findByUserId(user_id) {
        
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timed out - Cassandra")), 1000) //La promesa se rechaza después de los 1000ms (1 segundo).
        );
        
        try {
            this.client = await this.cassandra.getClient()
            
            await Promise.race([
                this.client.connect(),
                timeoutPromise
            ]);
            
            let result = await this.client.execute(
                this.queryFind,
                [user_id],
                { prepare: true, consistency: this.cassandra.concistencyLocalOne() }
            )
            const row = result.first()
            await this.client.shutdown()
            if (row) {
                return row
            }
            return null
        } catch (exception) {
            if (this.client !== null) {
                this.client.shutdown()
            }
            throw new DatabaseException(exception.message, 500, ErrorNomenclature.errorCassandra(), __dirname + ":" + Debugging.getLine())
        }
    }

    /**
     * Inserta un registro en la tabla de Cassandra. Pasarle los parámetros necesarios.
     */
    async insertOne( time, user_id, region ) {

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timed out - Cassandra")), 1000)
        );

        try {
            this.client = await this.cassandra.getClient()
            
            await Promise.race([
                this.client.connect(),
                timeoutPromise
            ]);

            const result = await this.client.execute(
                this.queryInsert,
                [ time, user_id, region ],
                { prepare: true, consistency: this.cassandra.concistencyLocalQuorum() }
            )
            this.client.shutdown()
        } catch (exception) {
            if (this.client !== null) {
                this.client.shutdown()
            }
            throw new DatabaseException(exception.message, 500, ErrorNomenclature.errorCassandra(), __dirname + ":" + Debugging.getLine())
        }
    }

    /**
     * Actualiza un registro en la tabla de Cassandra. Pasarle los parámetros necesarios a actualizar.
     */
    async updateOne(group_id, user_id, type, region, parametroA, parametroB ) {

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timed out - Cassandra")), 1000)
        );

        try {
            this.client = await this.cassandra.getClient()
            
            await Promise.race([
                this.client.connect(),
                timeoutPromise
            ]);

            const result = await this.client.execute(
                this.queryUpdate,
                [ new Date(), parametroA, parametroB, user_id, group_id, region],
                { prepare: true, consistency: this.cassandra.concistencyLocalQuorum() }
            )
            this.client.shutdown()
        } catch (exception) {
            if (this.client !== null) {
                this.client.shutdown()
            }
            throw new DatabaseException(exception.message, 500, ErrorNomenclature.errorCassandra(), __dirname + ":" + Debugging.getLine())
        }
    }

    /**
     * Elimina un registro de la tabla de Cassandra. En este caso por id de usuario.
     */
    async deleteOne(user_id) {

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timed out - Cassandra")), 1000)
        );

        try {
            this.client = await this.cassandra.getClient()
            
            await Promise.race([
                this.client.connect(),
                timeoutPromise
            ]);

            const result = await this.client.execute(
                this.queryDelete,
                [user_id],
                { prepare: true, consistency: this.cassandra.concistencyLocalQuorum() }
            )
            this.client.shutdown()
        } catch (exception) {
            if (this.client !== null) {
                this.client.shutdown()
            }
            throw new DatabaseException(exception.message, 500, ErrorNomenclature.errorCassandra(), __dirname + ":" + Debugging.getLine())
        }
    }

}

module.exports=ServiceRepository