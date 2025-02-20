'use strict';

const express = require('express');
const UserController = require('../controllers/UserController');
const api = express.Router();

const userController = new UserController();

api.post('/', userController.createUser.bind(userController));
api.delete('/:id', userController.deleteUser.bind(userController));
api.post('/update-password', userController.updatePassword.bind(userController));
api.post('/:id/check-upgrade', userController.checkUpgradeEndpoint.bind(userController));
api.get('/me', userController.getUserData.bind(userController));

module.exports = api; 