'use strict';

const express = require('express');
const ProductController = require('../controllers/ProductController');
const api = express.Router();

const productController = new ProductController();

// Agregar un log middleware
api.use((req, res, next) => {
    console.log(`Ruta de productos accedida: ${req.method} ${req.path}`);
    next();
});

api.get('/', productController.getProducts.bind(productController));
api.post('/', productController.createItem.bind(productController));
api.put('/:id', productController.updateItem.bind(productController));
api.patch('/:id/price', productController.updatePrice.bind(productController));
api.delete('/:id', productController.deleteItem.bind(productController));

module.exports = api; 