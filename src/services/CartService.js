'use strict';

const RedisService = require('./RedisService');
const CassandraService = require('./CassandraService');
const { BillingService, PaymentMethods, TAX_RATE } = require('./BillingService');
const config = require('../../config');

class CartService {
    constructor() {
        this.redisService = new RedisService();
        this.cassandraService = new CassandraService();
        this.billingService = new BillingService();
    }

    async addToCart(userId, productId) {
        try {
            console.log(`CartService: Agregando producto ${productId} al carrito del usuario ${userId}`);

            // Verificar que el producto existe
            const query = 'SELECT * FROM products WHERE id = ?';
            const products = await this.cassandraService.execute(query, [parseInt(productId)]);
            
            if (!products || products.length === 0) {
                throw new Error('Producto no encontrado');
            }

            const product = products[0];
            console.log('Producto encontrado:', product);

            // Obtener el carrito actual
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();

            // Estructura del carrito en Redis: hash con productId como campo y cantidad como valor
            let currentQuantity = await this.redisService.client.hget(cartKey, productId.toString()) || '0';
            currentQuantity = parseInt(currentQuantity);
            
            // Incrementar la cantidad
            await this.redisService.client.hset(cartKey, productId.toString(), (currentQuantity + 1).toString());
            
            // Obtener todo el carrito actualizado
            const cartItems = await this.redisService.client.hgetall(cartKey) || {};
            console.log('Carrito actualizado:', cartItems);

            // Convertir el carrito a un formato más útil
            const formattedCart = await this.formatCart(userId, cartItems);
            
            await this.redisService.disconnect();
            return formattedCart;
        } catch (error) {
            console.error('Error en addToCart:', error);
            throw error;
        }
    }

    async formatCart(userId, cartItems) {
        const items = [];
        for (const [productId, quantity] of Object.entries(cartItems)) {
            const query = 'SELECT * FROM products WHERE id = ?';
            const products = await this.cassandraService.execute(query, [parseInt(productId)]);
            if (products && products.length > 0) {
                const product = products[0];
                items.push({
                    productId: parseInt(productId),
                    quantity: parseInt(quantity),
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image,
                    subtotal: parseFloat(product.price) * parseInt(quantity)
                });
            }
        }

        return {
            userId,
            items,
            total: items.reduce((sum, item) => sum + item.subtotal, 0)
        };
    }

    async removeFromCart(userId, productId) {
        const cartKey = `cart:${userId}`;
        await this.redisService.connect();

        // Verificar si el carrito existe
        const cartExists = await this.redisService.client.exists(cartKey);
        if (!cartExists) {
            throw new Error('Carrito no encontrado');
        }

        // Remover una instancia del producto
        await this.redisService.client.hDel(cartKey, productId);

        // Obtener el carrito actualizado
        const cartItems = await this.redisService.client.hGetAll(cartKey);
        await this.redisService.disconnect();

        return {
            userId,
            items: Object.entries(cartItems).map(([id, quantity]) => ({
                productId: parseInt(id),
                quantity: parseInt(quantity)
            }))
        };
    }

    async getCart(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario no proporcionado');
            }

            console.log('Obteniendo carrito para usuario:', userId);
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();

            const cartExists = await this.redisService.client.exists(cartKey);
            if (!cartExists) {
                console.log('No existe carrito para el usuario:', userId);
                await this.redisService.disconnect();
                return { 
                    userId, 
                    items: [],
                    message: 'No tenés productos en tu carrito' 
                };
            }

            const cartItems = await this.redisService.client.hgetall(cartKey) || {};
            console.log('Items en Redis:', cartItems);

            if (!Object.keys(cartItems).length) {
                await this.redisService.disconnect();
                return { 
                    userId, 
                    items: [],
                    message: 'El carrito está vacío' 
                };
            }

            const formattedCart = await this.formatCart(userId, cartItems);
            await this.redisService.disconnect();
            return formattedCart;
        } catch (error) {
            console.error('Error en getCart:', error);
            throw error;
        }
    }

    async checkoutCart(userId, paymentMethod) {
        try {
            // Validar método de pago
            if (!Object.values(PaymentMethods).includes(paymentMethod)) {
                throw new Error('Método de pago inválido');
            }

            // Obtener el carrito actual
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();
            
            const cartItems = await this.redisService.client.hgetall(cartKey);
            if (!cartItems || Object.keys(cartItems).length === 0) {
                throw new Error('El carrito está vacío');
            }

            // Formatear el carrito para la factura
            const formattedCart = await this.formatCart(userId, cartItems);
            
            // Asegurarse de que los productos incluyan su ID
            const productsWithIds = formattedCart.items.map(item => ({
                _id: item.productId,
                name: item.name,
                price: item.price.toString(),
                quantity: item.quantity
            }));

            // Calcular totales
            const subtotal = formattedCart.total;
            const taxes = subtotal * TAX_RATE;
            const totalPrice = subtotal + taxes;

            // Crear la factura
            const bill = await this.billingService.createBill(
                userId,
                productsWithIds,
                totalPrice,
                paymentMethod
            );

            // Limpiar el carrito después de la compra exitosa
            await this.redisService.client.del(cartKey);
            
            await this.redisService.disconnect();
            return bill;
        } catch (error) {
            console.error('Error en checkoutCart:', error);
            throw error;
        }
    }

    async incrementItem(userId, productId) {
        try {
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();
            
            let currentQuantity = await this.redisService.client.hget(cartKey, productId.toString()) || '0';
            currentQuantity = parseInt(currentQuantity);
            
            await this.redisService.client.hset(cartKey, productId.toString(), (currentQuantity + 1).toString());
            
            const cartItems = await this.redisService.client.hgetall(cartKey);
            const formattedCart = await this.formatCart(userId, cartItems);
            
            await this.redisService.disconnect();
            return formattedCart;
        } catch (error) {
            console.error('Error en incrementItem:', error);
            throw error;
        }
    }

    async decrementItem(userId, productId) {
        try {
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();
            
            let currentQuantity = await this.redisService.client.hget(cartKey, productId.toString()) || '0';
            currentQuantity = parseInt(currentQuantity);
            
            if (currentQuantity <= 1) {
                await this.redisService.client.hdel(cartKey, productId.toString());
            } else {
                await this.redisService.client.hset(cartKey, productId.toString(), (currentQuantity - 1).toString());
            }
            
            const cartItems = await this.redisService.client.hgetall(cartKey);
            const formattedCart = await this.formatCart(userId, cartItems);
            
            await this.redisService.disconnect();
            return formattedCart;
        } catch (error) {
            console.error('Error en decrementItem:', error);
            throw error;
        }
    }

    async removeAllItems(userId, productId) {
        try {
            const cartKey = `cart:${userId}`;
            await this.redisService.connect();
            
            await this.redisService.client.hdel(cartKey, productId.toString());
            
            const cartItems = await this.redisService.client.hgetall(cartKey);
            const formattedCart = await this.formatCart(userId, cartItems);
            
            await this.redisService.disconnect();
            return formattedCart;
        } catch (error) {
            console.error('Error en removeAllItems:', error);
            throw error;
        }
    }
}

module.exports = CartService; 