'use strict';

const CartService = require('../services/CartService');

class CartController {
    constructor() {
        this.cartService = new CartService();
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
}

module.exports = CartController; 