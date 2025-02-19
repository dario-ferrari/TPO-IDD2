'use strict';

const express = require('express');
const UserController = require('../controllers/UserController');
const api = express.Router();

const userController = new UserController();

api.post('/users', userController.createUser.bind(userController));
api.delete('/users/:id', userController.deleteUser.bind(userController));
api.post('/users/update-password', userController.updatePassword.bind(userController));
api.post('/users/:id/check-upgrade', userController.checkUpgrade.bind(userController));

module.exports = api; 