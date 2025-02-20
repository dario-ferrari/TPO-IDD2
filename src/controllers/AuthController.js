'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async login(req, res, next) {
        try {
            console.log('Recibida petición de login:', req.body);
            const { username, password } = req.body;
            const result = await this.authService.login(username, password);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error en login:', error);
            next(error);
        }
    }

    async verifySession(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            const result = await this.authService.verifySession(token);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'No token provided' });
            }
            await this.authService.logout(token);
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;