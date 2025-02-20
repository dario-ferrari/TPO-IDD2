'use strict';

const { MongoClient } = require('mongodb');
const DatabaseException = require('./../exception/DatabaseException');
const ErrorNomenclature = require("../exception/ErrorNomenclature");
const Debugging = require('../util/Debugging');
const config = require('../../config');

const Databases = {
    USERS: 'users',
    BILLING: 'billing'
};

class MongoDBService {
    constructor(database = Databases.USERS) {
        this.client = null;
        this.db = null;
        this.dbName = database;
    }

    async connecting() {
        try {
            if (!this.client || !this.client.topology || !this.client.topology.isConnected()) {
                this.client = new MongoClient(config.mongodb.url, config.mongodb.options);
                await this.client.connect();
                this.db = this.client.db(config.mongodb.database);
            }
            return true;
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('Database connection not established');
        }
        return this.db.collection(collectionName);
    }

    async disconnect() {
        try {
            if (this.client && this.client.topology && this.client.topology.isConnected()) {
                await this.client.close();
                this.client = null;
                this.db = null;
            }
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
}

module.exports = { MongoDBService, Databases }; 