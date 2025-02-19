'use strict'

const { MongoClient } = require("mongodb");

class MongoConnect {
    constructor(config) {
        this.config = config;
        this.client = new MongoClient(config.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    async connect() {
        if (!this.client.isConnected) {
            await this.client.connect();
        }
        return this.client.db(this.config.database);
    }

    async close() {
        await this.client.close();
    }
}

module.exports = MongoConnect;