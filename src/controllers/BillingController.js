const BillingService = require("../services/BillingService");
const config = require("../../config");

const billingService = new BillingService(config);

class BillingController {
    /**
     * Crear una factura para un pedido
     */
    static async createInvoice(req, res) {
        try {
            const { orderId, userId, totalAmount, paymentMethod } = req.body;
            const result = await billingService.createInvoice(orderId, userId, totalAmount, paymentMethod);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Registrar un pago para una factura
     */
    static async registerPayment(req, res) {
        try {
            const { invoiceId, paymentStatus, transactionId } = req.body;
            const result = await billingService.registerPayment(invoiceId, paymentStatus, transactionId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener facturas de un usuario
     */
    static async getInvoicesByUser(req, res) {
        try {
            const { userId } = req.params;
            const invoices = await billingService.getInvoicesByUser(userId);
            return res.status(200).json({ userId, invoices });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener una factura por su ID
     */
    static async getInvoiceById(req, res) {
        try {
            const { invoiceId } = req.params;
            const invoice = await billingService.getInvoiceById(invoiceId);
            if (!invoice) {
                return res.status(404).json({ error: "Invoice not found" });
            }
            return res.status(200).json(invoice);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = BillingController;