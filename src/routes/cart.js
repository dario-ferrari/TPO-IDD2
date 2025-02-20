'use strict';

const express = require('express');
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middleware/AuthMiddleware');
const api = express.Router();

const cartController = new CartController();

// Usar el middleware de autenticación en todas las rutas del carrito
api.use(authMiddleware.verifyToken.bind(authMiddleware));

// Rutas del carrito
api.post('/add', cartController.addToCart.bind(cartController));
api.get('/', cartController.getCart.bind(cartController));
api.post('/checkout', cartController.checkoutCart.bind(cartController));

module.exports = api; 