'use strict'

const CassandraConnect  = require("./../repository/Cassandra/CassandraConnect")
const DatabaseException = require('./../exception/DatabaseException')
const config            = require('./../../config')
const ErrorNomenclature = require("../exception/ErrorNomenclature")
const Debugging         = require('../util/Debugging')

class CassandraService {
    constructor() {
        this.cassandraConnect = new CassandraConnect(config.cassandra)
    }

    async connecting() {
        try {
            this.client = await this.cassandraConnect.getClient()
            await this.client.connect()
            return true
        } catch(exception) {
            throw new DatabaseException(exception.message, 500, ErrorNomenclature.errorCassandra(), __dirname + ":" + Debugging.getLine())
        }
    }
}

module.exports = CassandraService