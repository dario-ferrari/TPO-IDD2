'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CacheService = require('./CacheService');
const config = require('../../config');
const jwtConfig = require('../../config/common/jwt');

class AuthService {
    constructor() {
        this.cacheService = new CacheService(config.redis.rw, config.redis.ttl);
    }

    async signup(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, password: hashedPassword };

        //Guardamos usuario en Redis (puede mejorarse con Cassandra)
        await this.cacheService.set(`user:${username}`, JSON.stringify(user));

        return { message: "User registered successfully" };
    }

    async login(username, password) {
        const user = await this.cacheService.get(`user:${username}`);
        if (!user) throw new Error("User not found");

        const parsedUser = JSON.parse(user);
        const match = await bcrypt.compare(password, parsedUser.password);
        if (!match) throw new Error("Invalid credentials");

        //Generamos JWT
        const token = jwt.sign({ username }, jwtConfig.secret, { expiresIn: '1h' });

        //Guardamos el token en Redis
        await this.cacheService.set(`session:${username}`, token, 3600);

        return { message: "Login successful", token };
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