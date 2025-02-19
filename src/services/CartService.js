'use strict';

const CacheService = require('./CacheService');
const MongoDBService = require('./MongoDBService');
const config = require('../../config');

class CartService {
    constructor() {
        this.cacheService = new CacheService(config.redis.rw, null, 1); // Usamos DB 1 para carritos
        this.mongoService = new MongoDBService();
    }

    async addToCart(userId, productId) {
        await this.mongoService.connecting();
        
        // Verificar que el usuario existe
        const usersCollection = this.mongoService.getCollection('users');
        const user = await usersCollection.findOne({ id: parseInt(userId) });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar que el producto existe
        const productsCollection = this.mongoService.getCollection('products');
        const product = await productsCollection.findOne({ id: parseInt(productId) });
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const cartKey = `cart:${userId}`;
        await this.cacheService.connect();

        // Agregar producto al carrito
        await this.cacheService.client.rpush(cartKey, productId);
        
        // Obtener el carrito actualizado
        const cart = await this.cacheService.client.lrange(cartKey, 0, -1);
        await this.cacheService.disconnect();

        return {
            userId,
            products: cart.map(id => parseInt(id))
        };
    }

    async removeFromCart(userId, productId) {
        const cartKey = `cart:${userId}`;
        await this.cacheService.connect();

        // Verificar si el carrito existe
        const cartExists = await this.cacheService.client.exists(cartKey);
        if (!cartExists) {
            throw new Error('Carrito no encontrado');
        }

        // Remover una instancia del producto
        await this.cacheService.client.lrem(cartKey, 1, productId);

        // Obtener el carrito actualizado
        const cart = await this.cacheService.client.lrange(cartKey, 0, -1);
        await this.cacheService.disconnect();

        return {
            userId,
            products: cart.map(id => parseInt(id))
        };
    }

    async getCart(userId) {
        const cartKey = `cart:${userId}`;
        await this.cacheService.connect();

        const cart = await this.cacheService.client.lrange(cartKey, 0, -1);
        await this.cacheService.disconnect();

        if (!cart.length) {
            throw new Error('Carrito no encontrado');
        }

        return {
            userId,
            products: cart.map(id => parseInt(id))
        };
    }
}

module.exports = CartService; 