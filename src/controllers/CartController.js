'use strict';

const CartService = require('../services/CartService');
const UserController = require('./UserController');

class CartController {
    constructor() {
        this.cartService = new CartService();
        this.userController = new UserController();
    }

    async addToCart(req, res, next) {
        try {
            const { userId, productId } = req.body;
            
            if (!userId || !productId) {
                return res.status(400).json({
                    error: 'userId y productId son requeridos'
                });
            }

            const result = await this.cartService.addToCart(userId, productId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async removeFromCart(req, res, next) {
        try {
            const { userId, productId } = req.body;
            
            if (!userId || !productId) {
                return res.status(400).json({
                    error: 'userId y productId son requeridos'
                });
            }

            const result = await this.cartService.removeFromCart(userId, productId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCart(req, res, next) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({
                    error: 'userId es requerido'
                });
            }

            const result = await this.cartService.getCart(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async checkoutCart(req, res, next) {
        try {
            const { userId } = req.params;
            const { paymentMethod } = req.body;
            
            if (!userId || !paymentMethod) {
                return res.status(400).json({
                    error: 'userId y paymentMethod son requeridos'
                });
            }

            const result = await this.cartService.checkoutCart(userId, paymentMethod);

            // Verificar upgrade de categoría después de la compra
            await this.userController.checkUpgrade(req, res, next);

            res.status(200).json({
                message: 'Compra realizada exitosamente',
                ...result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CartController; 