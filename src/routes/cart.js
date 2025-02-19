'use strict';

const express = require('express');
const CartController = require('../controllers/CartController');
const api = express.Router();

const cartController = new CartController();

api.post('/cart/add', cartController.addToCart.bind(cartController));
api.post('/cart/remove', cartController.removeFromCart.bind(cartController));
api.get('/cart/:userId', cartController.getCart.bind(cartController));
api.post('/cart/:userId/checkout', cartController.checkoutCart.bind(cartController));

module.exports = api; 