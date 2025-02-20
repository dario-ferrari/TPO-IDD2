'use strict';

const MongoConnect = require('../repository/mongodb/MongoConnect');
const { ObjectId } = require("mongodb");

class BillingService {
    constructor(config) {
        this.mongo = new MongoConnect(config.mongodb);
    }

    /**
     * Crear una factura para un pedido
     */
    async createInvoice(orderId, userId, totalAmount, paymentMethod) {
        const db = await this.mongo.connect();
        const invoiceCollection = db.collection("invoices");

        const invoice = {
            orderId,
            userId,
            totalAmount,
            paymentMethod,
            status: "pending", // Estado inicial del pago
            createdAt: new Date(),
        };

        const result = await invoiceCollection.insertOne(invoice);
        return { invoiceId: result.insertedId, status: "Invoice created successfully" };
    }

    /**
     * Registrar un pago para una factura
     */
    async registerPayment(invoiceId, paymentStatus, transactionId = null) {
        const db = await this.mongo.connect();
        const invoiceCollection = db.collection("invoices");

        try {
            // Verificar si el invoiceId es un ObjectId válido
            if (!ObjectId.isValid(invoiceId)) {
                throw new Error("Invalid invoice ID format");
            }

            const objectId = new ObjectId(invoiceId);

            const updateData = {
                status: paymentStatus,
                paidAt: new Date(),
            };

            if (transactionId) {
                updateData.transactionId = transactionId;
            }

            const result = await invoiceCollection.updateOne(
                { _id: objectId },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                throw new Error("Invoice not found");
            }

            return { invoiceId, status: `Payment status updated to ${paymentStatus}` };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Obtener todas las facturas de un usuario
     */
    async getInvoicesByUser(userId) {
        const db = await this.mongo.connect();
        const invoiceCollection = db.collection("invoices");
        return await invoiceCollection.find({ userId }).toArray();
    }

    /**
     * Obtener una factura por su ID
     */
    async getInvoiceById(invoiceId) {
        const db = await this.mongo.connect();
        const invoiceCollection = db.collection("invoices");

        try {
            // Verificar si el invoiceId es un ObjectId válido
            if (!ObjectId.isValid(invoiceId)) {
                throw new Error("Invalid invoice ID format");
            }

            const objectId = new ObjectId(invoiceId);
            const invoice = await invoiceCollection.findOne({ _id: objectId });

            if (!invoice) {
                throw new Error("Invoice not found");
            }

            return invoice;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = BillingService;