'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const CacheService = require('./CacheService');
const { MongoDBService, Databases } = require('./MongoDBService');
const jwtConfig = require('../../config/common/jwt');

class AuthService {
    constructor() {
        this.cacheService = new CacheService(config.redis);
        this.mongoService = new MongoDBService(Databases.USERS);
        this.collection = 'users';
    }

    async login(username, password) {
        try {
            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);
            
            const user = await collection.findOne({ username });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Contraseña incorrecta');
            }

            const token = jwt.sign(
                { 
                    userId: user._id.toString(),
                    username: user.username,
                    nombre: user.nombre,
                    categoria: user.categoria
                },
                config.jwt.secret,
                { expiresIn: '24h' }
            );

            try {
                await this.cacheService.set(`token:${user._id}`, token, 86400);
            } catch (error) {
                console.error('Error al guardar en cache:', error);
                // Continuamos aunque falle el cache
            }

            return {
                token,
                user: {
                    id: user._id,
                    nombre: user.nombre,
                    categoria: user.categoria
                }
            };
        } catch (error) {
            throw error;
        } finally {
            await this.mongoService.disconnect();
        }
    }

    async verifySession(token) {
        try {
            const decoded = jwt.verify(token, jwtConfig.secret);
            const session = await this.cacheService.get(`session:${decoded.username}`);
            if (session !== token) throw new Error("Invalid session");

            return { message: "Session is valid", username: decoded.username };
        } catch (error) {
            throw new Error("Invalid token");
        }
    }

    async logout(token) {
        try {
            const decoded = jwt.verify(token, jwtConfig.secret);
            await this.cacheService.del(`session:${decoded.username}`);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

module.exports = AuthService;