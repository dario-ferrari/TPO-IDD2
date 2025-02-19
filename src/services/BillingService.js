'use strict';

const { MongoDBService, Databases } = require('./MongoDBService');

const PaymentMethods = {
    DEBITO: 'DEBITO',
    CREDITO: 'CREDITO',
    MERCADO_PAGO: 'MERCADO_PAGO'
};

const TAX_RATE = 0.21; // 21% de impuestos

class BillingService {
    constructor() {
        this.mongoService = new MongoDBService(Databases.BILLING);
        this.collection = 'bills';
    }

    async createBill(buyerName, productList, totalPrice, paymentMethod) {
        await this.mongoService.connecting();
        const collection = this.mongoService.getCollection(this.collection);

        // Obtener el último ID para incrementar
        const lastBill = await collection.findOne({}, { sort: { id: -1 } });
        const newId = (lastBill?.id || 0) + 1;

        // Calcular impuestos
        const taxAmount = (totalPrice * BigInt(Math.round(TAX_RATE * 100))) / 100n;
        const finalPrice = totalPrice + taxAmount;

        const bill = {
            id: newId,
            buyerName,
            products: productList.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price.toString() // Guardamos el precio en centavos como string
            })),
            subtotal: totalPrice.toString(),
            taxes: taxAmount.toString(),
            totalPrice: finalPrice.toString(),
            paymentMethod,
            date: new Date()
        };

        await collection.insertOne(bill);
        return {
            ...bill,
            products: bill.products.map(product => ({
                ...product,
                price: Number(product.price) / 100 // Convertir a formato decimal para la respuesta
            }))
        };
    }

    async getBill(billId) {
        await this.mongoService.connecting();
        const collection = this.mongoService.getCollection(this.collection);
        return await collection.findOne({ id: billId });
    }

    async getAllBills() {
        await this.mongoService.connecting();
        const collection = this.mongoService.getCollection(this.collection);
        return await collection.find().sort({ id: -1 }).toArray();
    }

    async getBillsByBuyer(buyerName) {
        await this.mongoService.connecting();
        const collection = this.mongoService.getCollection(this.collection);
        return await collection.find({ buyerName }).sort({ date: -1 }).toArray();
    }

    isValidPaymentMethod(method) {
        return Object.values(PaymentMethods).includes(method);
    }
}

module.exports = { BillingService, PaymentMethods, TAX_RATE }; 