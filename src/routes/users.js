'use strict';

const express = require('express');
const UserController = require('../controllers/UserController');
const api = express.Router();

const userController = new UserController();

api.post('/users', userController.createUser.bind(userController));
api.delete('/users/:id', userController.deleteUser.bind(userController));
api.put('/users/:id', userController.updateUser.bind(userController));

module.exports = api; 