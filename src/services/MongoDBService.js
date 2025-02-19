'use strict';

const { MongoClient } = require('mongodb');
const DatabaseException = require('./../exception/DatabaseException');
const ErrorNomenclature = require("../exception/ErrorNomenclature");
const Debugging = require('../util/Debugging');

class MongoDBService {
    constructor() {
        this.url = 'mongodb://localhost:27017';
        this.dbName = 'usersdb';
        this.client = null;
    }

    async connecting() {
        try {
            if (!this.client) {
                this.client = await MongoClient.connect(this.url);
                this.db = this.client.db(this.dbName);
            }
            return true;
        } catch(exception) {
            throw new DatabaseException(
                exception.message, 
                500, 
                ErrorNomenclature.errorMongoDB(), 
                __dirname + ":" + Debugging.getLine()
            );
        }
    }

    getCollection(name) {
        return this.db.collection(name);
    }
}

module.exports = MongoDBService; 