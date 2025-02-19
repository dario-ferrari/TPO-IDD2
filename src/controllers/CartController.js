const CartService = require("../services/CartService");
const config = require("../../config");

const cartService = new CartService(config);

class CartController {
    /**
     * Agregar un producto al carrito
     */
    static async addToCart(req, res) {
        try {
            const { userId, productId, quantity } = req.body;
            await cartService.addToCart(userId, productId, quantity);
            return res.status(200).json({ message: "Product added to cart" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener el carrito de un usuario
     */
    static async getCart(req, res) {
        try {
            const { userId } = req.params;
            const cart = await cartService.getCart(userId);
            return res.status(200).json({ userId, cart });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Eliminar un producto del carrito
     */
    static async removeFromCart(req, res) {
        try {
            const { userId, productId } = req.body;
            await cartService.removeFromCart(userId, productId);
            return res.status(200).json({ message: "Product removed from cart" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Vaciar el carrito de un usuario
     */
    static async clearCart(req, res) {
        try {
            const { userId } = req.body;
            await cartService.clearCart(userId);
            return res.status(200).json({ message: "Cart cleared" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CartController;