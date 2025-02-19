'use strict';

const CacheService = require('./CacheService');
const MongoDBService = require('./MongoDBService');
const { BillingService, PaymentMethods, TAX_RATE } = require('./BillingService');
const config = require('../../config');

class CartService {
    constructor() {
        this.cacheService = new CacheService(config.redis.rw, null, 1); // Usamos DB 1 para carritos
        this.mongoService = new MongoDBService();
        this.billingService = new BillingService();
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

    async checkoutCart(userId, paymentMethod) {
        if (!this.billingService.isValidPaymentMethod(paymentMethod)) {
            throw new Error('Método de pago inválido');
        }

        // Obtener el carrito
        const cartKey = `cart:${userId}`;
        await this.cacheService.connect();
        const cart = await this.cacheService.client.lrange(cartKey, 0, -1);
        
        if (!cart.length) {
            throw new Error('Carrito vacío');
        }

        // Obtener información del usuario
        await this.mongoService.connecting();
        const usersCollection = this.mongoService.getCollection('users');
        const user = await usersCollection.findOne({ id: parseInt(userId) });
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Obtener información de productos y calcular total
        const productsCollection = this.mongoService.getCollection('products');
        let subtotalInCents = 0n;
        const productDetails = [];

        for (const productId of cart) {
            const product = await productsCollection.findOne({ id: parseInt(productId) });
            if (!product) {
                throw new Error(`Producto ${productId} no encontrado`);
            }
            subtotalInCents += BigInt(product.price);
            productDetails.push({
                id: product.id,
                name: product.name,
                price: product.price
            });
        }

        // Calcular impuestos y total
        const taxAmountInCents = (subtotalInCents * BigInt(Math.round(TAX_RATE * 100))) / 100n;
        const totalPriceInCents = subtotalInCents + taxAmountInCents;

        // Crear factura
        const bill = await this.billingService.createBill(
            user.nombre,
            productDetails,
            subtotalInCents,
            paymentMethod
        );

        // Actualizar cantidadGastos del usuario con el total (incluyendo impuestos)
        const newGastos = BigInt(user.cantidadGastos) + totalPriceInCents;
        await usersCollection.updateOne(
            { id: user.id },
            { $set: { cantidadGastos: newGastos.toString() } }
        );

        // Eliminar carrito
        await this.cacheService.client.del(cartKey);
        await this.cacheService.disconnect();

        return {
            billId: bill.id,
            subtotal: Number(subtotalInCents) / 100,
            taxes: Number(taxAmountInCents) / 100,
            total: Number(totalPriceInCents) / 100,
            productCount: productDetails.length
        };
    }
}

module.exports = CartService; 