'use strict';

const Redis = require('ioredis');
const config = require('../../config');

class RedisService {
    constructor() {
        this.client = null;
    }

    async connect() {
        if (!this.client) {
            this.client = new Redis({
                ...config.redis,
                db: 1 // Usar base de datos 1 para carritos
            });
            
            this.client.on('error', (err) => console.error('Redis Cart Error:', err));
            await this.client.select(1);
            console.log('Conectado a Redis DB 1 (Carritos)');
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}

module.exports = RedisService; 