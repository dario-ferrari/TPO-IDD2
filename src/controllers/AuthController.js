'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);
        this.session = this.session.bind(this);
        this.logout = this.logout.bind(this);
    }

    async signup(req, res) {
        const { username, password } = req.body;
        try {
            const result = await this.authService.signup(username, password);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        try {
            const result = await this.authService.login(username, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async session(req, res) {
        const token = req.headers.authorization?.split(' ')[1];
        try {
            const result = await this.authService.verifySession(token);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async logout(req, res) {
        const token = req.headers.authorization?.split(' ')[1];
        try {
            await this.authService.logout(token);
            res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;