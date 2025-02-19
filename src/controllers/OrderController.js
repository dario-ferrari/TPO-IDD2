const OrderService = require("../services/OrderService");
const config = require("../../config");

const orderService = new OrderService(config);

class OrderController {
    /**
     * Convertir el carrito en un pedido.
     */
    static async createOrder(req, res) {
        try {
            const { userId } = req.body;
            const result = await orderService.createOrder(userId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener pedidos de un usuario.
     */
    static async getOrdersByUser(req, res) {
        try {
            const { userId } = req.params;
            const orders = await orderService.getOrdersByUser(userId);
            return res.status(200).json({ userId, orders });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener un pedido por ID.
     */
    static async getOrderById(req, res) {
        try {
            const { orderId } = req.params;
            const order = await orderService.getOrderById(orderId);
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }
            return res.status(200).json(order);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OrderController;