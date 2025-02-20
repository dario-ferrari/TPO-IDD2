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
            console.log('Token decodificado:', req.user);
            const userId = req.user.userId; // Este es el _id de MongoDB
            console.log('ID de usuario extraído:', userId);
            
            const { productId } = req.body;
            
            if (!userId) {
                console.error('No se encontró userId en el token');
                return res.status(401).json({
                    error: 'Usuario no autenticado correctamente'
                });
            }

            if (!productId) {
                return res.status(400).json({
                    error: 'productId es requerido'
                });
            }

            console.log(`Agregando producto ${productId} al carrito del usuario ${userId}`);
            const result = await this.cartService.addToCart(userId, productId);
            console.log('Resultado de addToCart:', result);
            
            res.status(200).json({
                success: true,
                message: 'Producto agregado al carrito exitosamente',
                cart: result
            });
        } catch (error) {
            console.error('Error en addToCart:', error);
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
            console.log('Token decodificado:', req.user);
            const userId = req.user.userId;
            console.log('ID de usuario extraído:', userId);

            if (!userId) {
                console.error('No se encontró userId en el token');
                return res.status(401).json({
                    error: 'Usuario no autenticado correctamente'
                });
            }

            const result = await this.cartService.getCart(userId);
            console.log('Carrito obtenido:', result);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error en getCart:', error);
            next(error);
        }
    }

    async checkoutCart(req, res, next) {
        try {
            const userId = req.user.userId;
            const { paymentMethod } = req.body;
            
            if (!userId || !paymentMethod) {
                return res.status(400).json({
                    error: 'userId y paymentMethod son requeridos'
                });
            }

            // Procesar el checkout
            const result = await this.cartService.checkoutCart(userId, paymentMethod);

            try {
                // Actualizar gastos del usuario y verificar upgrade
                const total = parseFloat(result.totalPrice);
                await this.userController.updateUserSpending(userId, total);
                await this.userController.checkUpgradeLogic(userId);

                res.status(200).json({
                    message: 'Compra realizada exitosamente',
                    bill: result
                });
            } catch (userError) {
                console.error('Error actualizando usuario:', userError);
                res.status(200).json({
                    message: 'Compra realizada exitosamente, pero hubo un error actualizando el perfil del usuario',
                    bill: result
                });
            }
        } catch (error) {
            console.error('Error en checkout:', error);
            next(error);
        }
    }

    async incrementItem(req, res, next) {
        try {
            const userId = req.user.userId;
            const { productId } = req.body;
            
            if (!userId || !productId) {
                return res.status(400).json({
                    error: 'userId y productId son requeridos'
                });
            }

            const result = await this.cartService.incrementItem(userId, productId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async decrementItem(req, res, next) {
        try {
            const userId = req.user.userId;
            const { productId } = req.body;
            
            if (!userId || !productId) {
                return res.status(400).json({
                    error: 'userId y productId son requeridos'
                });
            }

            const result = await this.cartService.decrementItem(userId, productId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async removeAllItems(req, res, next) {
        try {
            const userId = req.user.userId;
            const { productId } = req.body;
            
            if (!userId || !productId) {
                return res.status(400).json({
                    error: 'userId y productId son requeridos'
                });
            }

            const result = await this.cartService.removeAllItems(userId, productId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CartController; 