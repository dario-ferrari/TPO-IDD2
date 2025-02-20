'use strict';

const CacheService = require('./CacheService');
const CassandraService = require('./CassandraService');
const { BillingService, PaymentMethods, TAX_RATE } = require('./BillingService');
const config = require('../../config');

class CartService {
    constructor() {
        this.cacheService = new CacheService();
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
            await this.cacheService.connect();

            // Estructura del carrito en Redis: hash con productId como campo y cantidad como valor
            let currentQuantity = await this.cacheService.client.hGet(cartKey, productId.toString()) || 0;
            currentQuantity = parseInt(currentQuantity);
            
            // Incrementar la cantidad
            await this.cacheService.client.hSet(cartKey, productId.toString(), (currentQuantity + 1).toString());
            
            // Obtener todo el carrito actualizado
            const cartItems = await this.cacheService.client.hGetAll(cartKey);
            console.log('Carrito actualizado:', cartItems);

            // Convertir el carrito a un formato más útil
            const formattedCart = await this.formatCart(userId, cartItems);
            
            await this.cacheService.disconnect();
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
        await this.cacheService.connect();

        // Verificar si el carrito existe
        const cartExists = await this.cacheService.client.exists(cartKey);
        if (!cartExists) {
            throw new Error('Carrito no encontrado');
        }

        // Remover una instancia del producto
        await this.cacheService.client.hDel(cartKey, productId);

        // Obtener el carrito actualizado
        const cartItems = await this.cacheService.client.hGetAll(cartKey);
        await this.cacheService.disconnect();

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
            await this.cacheService.connect();

            const cartExists = await this.cacheService.client.exists(cartKey);
            if (!cartExists) {
                console.log('No existe carrito para el usuario:', userId);
                await this.cacheService.disconnect();
                return { 
                    userId, 
                    items: [],
                    message: 'No tienes productos en tu carrito' 
                };
            }

            const cartItems = await this.cacheService.client.hGetAll(cartKey);
            console.log('Items en Redis:', cartItems);

            if (!Object.keys(cartItems).length) {
                await this.cacheService.disconnect();
                return { 
                    userId, 
                    items: [],
                    message: 'Tu carrito está vacío' 
                };
            }

            // Obtener detalles de los productos
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
                        description: product.description,
                        price: parseFloat(product.price),
                        image: product.image
                    });
                }
            }

            console.log('Items procesados:', items);
            await this.cacheService.disconnect();

            return {
                userId,
                items
            };
        } catch (error) {
            console.error('Error en getCart:', error);
            throw error;
        }
    }

    async checkoutCart(userId, paymentMethod) {
        if (!this.billingService.isValidPaymentMethod(paymentMethod)) {
            throw new Error('Método de pago inválido');
        }

        // Obtener el carrito
        const cartKey = `cart:${userId}`;
        await this.cacheService.connect();
        const cartItems = await this.cacheService.client.hGetAll(cartKey);
        
        if (!Object.keys(cartItems).length) {
            throw new Error('Carrito vacío');
        }

        // Obtener información del usuario
        const query = 'SELECT * FROM users WHERE id = ?';
        const users = await this.cassandraService.execute(query, [parseInt(userId)]);
        
        if (!users || users.length === 0) {
            throw new Error('Usuario no encontrado');
        }

        const user = users[0];

        // Obtener información de productos y calcular total
        const products = await this.cassandraService.execute('SELECT * FROM products WHERE id IN ?', [Object.keys(cartItems).map(id => parseInt(id))]);
        let subtotalInCents = 0n;
        const productDetails = [];

        for (const product of products) {
            const quantity = parseInt(cartItems[product.id.toString()]);
            subtotalInCents += BigInt(product.price) * BigInt(quantity);
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
            user.username,
            productDetails,
            subtotalInCents,
            paymentMethod
        );

        // Actualizar cantidadGastos del usuario con el total (incluyendo impuestos)
        const currentGastos = user.cantidadGastos ? BigInt(user.cantidadGastos) : 0n;
        const newGastos = currentGastos + totalPriceInCents;
        await this.cassandraService.execute('UPDATE users SET cantidadGastos = ? WHERE id = ?', [newGastos.toString(), parseInt(userId)]);

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