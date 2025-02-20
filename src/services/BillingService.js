'use strict';

const { MongoDBService, Databases } = require('./MongoDBService');
const DatabaseException = require('./../exception/DatabaseException');
const ErrorNomenclature = require("../exception/ErrorNomenclature");
const Debugging = require('../util/Debugging');

const PaymentMethods = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    CASH: 'cash'
};

const TAX_RATE = 0.21; // 21% IVA

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

        // Calcular impuestos con mayor precisión
        // Convertimos la tasa de impuesto a BigInt con 4 decimales de precisión
        const TAX_RATE_BIGINT = BigInt(Math.floor(TAX_RATE * 10000));
        // Multiplicamos primero por la tasa y luego dividimos para mantener la precisión
        const taxAmount = (totalPrice * TAX_RATE_BIGINT) / 10000n;
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