'use strict';

const RedisConnect = require('../repository/redis/RedisConnect');

class CartService {
    constructor(config) {
        this.redis = new RedisConnect(config.redis.rw);
        this.cartExpiration = config.redis.cart_ttl || 3600; // Expira en 1 hora por defecto
    }

    /**
     * Agregar un producto al carrito
     */
    async addToCart(userId, productId, quantity) {
        await this.redis.connect();
        const key = `cart:${userId}`;

        let cart = await this.redis.getClient().hGetAll(key);

        if (!cart) {
            cart = {};
        }

        // Si el producto ya está en el carrito, actualiza la cantidad
        cart[productId] = (cart[productId] ? parseInt(cart[productId]) : 0) + parseInt(quantity);

        await this.redis.getClient().hSet(key, cart);
        await this.redis.getClient().expire(key, this.cartExpiration); // Expira después del tiempo configurado
    }

    /**
     * Obtener el carrito de un usuario
     */
    async getCart(userId) {
        await this.redis.connect();
        const key = `cart:${userId}`;
        const cart = await this.redis.getClient().hGetAll(key);
        return cart || {};
    }

    /**
     * Eliminar un producto del carrito
     */
    async removeFromCart(userId, productId) {
        await this.redis.connect();
        const key = `cart:${userId}`;
        await this.redis.getClient().hDel(key, productId);
    }

    /**
     * Vaciar el carrito de un usuario
     */
    async clearCart(userId) {
        await this.redis.connect();
        const key = `cart:${userId}`;
        await this.redis.getClient().del(key);
    }
}

module.exports = CartService;
