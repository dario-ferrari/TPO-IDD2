'use strict'

const cassandra = require('cassandra-driver')
const dns = require("node:dns")

class CassandraConnect {
    constructor(config) {
        this.config = config
        this.client = null
    }

    async getClient() {
        if (!this.client) {
            this.client = new cassandra.Client({
                contactPoints: this.config.contactPoints,
                localDataCenter: this.config.localDataCenter,
                keyspace: this.config.keyspace
            })
        }
        return this.client
    }

    concistencyLocalOne() {
        return cassandra.types.consistencies.localOne
    }

    concistencyLocalQuorum() {
        return cassandra.types.consistencies.localQuorum
    }

    getTimeCassandraUUID() {
        return cassandra.types.TimeUuid.now()
    }
    

    async setLocalDataCenter() {

        let localDataCenter = new Promise((resolve, reject) => {

            console.log(this.config.dns)
            dns.resolveAny(this.config.dns, function (error, txtResult) {
                console.log(error)
                console.log(txtResult)
                let dataCenter = null
                if (error) {
                    reject(error)
                }

                if (txtResult.forEach != "undefined" || txtResult.length > 0) {
                    txtResult.forEach(element => {
                        console.log(element)
                        let result = element[0].search(/DC=/g)
                        if (result != -1) {
                            dataCenter = element[0].split("DC=")[1]
                            resolve(dataCenter)
                        }
                    })
                } else {
                    reject(error)
                }
            })
        })
        
        return localDataCenter.then(value => {
            return value
        }).catch(err => {
            console.log(err)
            return this.config.localDataCenter
        })
    }
    
}

module.exports = CassandraConnect