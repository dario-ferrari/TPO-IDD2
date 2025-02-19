'use strict';

const MongoConnect = require('../repository/mongodb/MongoConnect');
const CartService = require('./CartService');

class OrderService {
    constructor(config) {
        this.mongo = new MongoConnect(config.mongodb);
        this.cartService = new CartService(config);
    }

    /**
     * Convertir un carrito en un pedido y almacenarlo en MongoDB.
     */
    async createOrder(userId) {
        const db = await this.mongo.connect();
        const collection = db.collection("orders");

        // Obtener el carrito de Redis
        const cart = await this.cartService.getCart(userId);
        if (!cart || Object.keys(cart).length === 0) {
            throw new Error("Cart is empty");
        }

        // Crear el objeto de pedido
        const order = {
            userId,
            items: Object.entries(cart).map(([productId, quantity]) => ({
                productId,
                quantity: parseInt(quantity),
            })),
            status: "pending", // Estado inicial del pedido
            createdAt: new Date(),
        };

        // Guardar el pedido en MongoDB
        const result = await collection.insertOne(order);

        // Vaciar el carrito después de generar el pedido
        await this.cartService.clearCart(userId);

        return { orderId: result.insertedId, status: "Order created successfully" };
    }

    /**
     * Obtener los pedidos de un usuario.
     */
    async getOrdersByUser(userId) {
        const db = await this.mongo.connect();
        const collection = db.collection("orders");
        return await collection.find({ userId }).toArray();
    }

    /**
     * Obtener un pedido por su ID.
     */
    async getOrderById(orderId) {
        const db = await this.mongo.connect();
        const collection = db.collection("orders");
        return await collection.findOne({ _id: orderId });
    }
}

module.exports = OrderService;