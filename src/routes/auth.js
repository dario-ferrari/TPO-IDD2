'use strict';

const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();
const authController = new AuthController();

// Definir las rutas con sus respectivos callbacks
router.post('/login', (req, res, next) => {
    authController.login(req, res, next);
});

router.post('/logout', (req, res, next) => {
    authController.logout(req, res, next);
});

router.post('/verify', (req, res, next) => {
    authController.verifySession(req, res, next);
});

module.exports = router;