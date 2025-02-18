'use strict';

const express = require('express');
const AuthController = require('../controllers/AuthController');
const api = express.Router();

const authController = new AuthController();

api.post('/auth/signup', authController.signup);
api.post('/auth/login', authController.login);
api.get('/auth/session', authController.session);
api.delete('/auth/logout', authController.logout);

module.exports = api;