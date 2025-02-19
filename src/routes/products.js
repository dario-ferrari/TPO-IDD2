'use strict';

const express = require('express');
const ProductController = require('../controllers/ProductController');
const api = express.Router();

const productController = new ProductController();

api.post('/items', productController.createItem.bind(productController));
api.delete('/items/:id', productController.deleteItem.bind(productController));

module.exports = api; 