'use strict';

const { MongoDBService, Databases } = require('./MongoDBService');
const DatabaseException = require('./../exception/DatabaseException');
const ErrorNomenclature = require("../exception/ErrorNomenclature");
const Debugging = require('../util/Debugging');

const PaymentMethods = {
    DEBITO: 'DEBITO',
    CREDITO: 'CREDITO',
    MERCADO_PAGO: 'MERCADO_PAGO'
};

const TAX_RATE = 0.21; // 21% IVA

class BillingService {
    constructor() {
        this.mongoService = new MongoDBService(Databases.BILLING);
        this.collection = 'bills';
    }

    async createBill(userId, productList, totalPrice, paymentMethod) {
        try {
            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            // Validar método de pago
            if (!Object.values(PaymentMethods).includes(paymentMethod)) {
                throw new Error(`Método de pago inválido: ${paymentMethod}`);
            }

            // Calcular impuestos
            const subtotalBigInt = BigInt(Math.round(totalPrice * 100));
            const taxAmountBigInt = (subtotalBigInt * BigInt(Math.floor(TAX_RATE * 100))) / BigInt(100);
            const finalPriceBigInt = subtotalBigInt + taxAmountBigInt;

            const bill = {
                userId: userId,
                products: productList.map(product => ({
                    _id: product._id,
                    name: product.name,
                    price: product.price.toString(),
                    quantity: product.quantity
                })),
                subtotal: (subtotalBigInt / BigInt(100)).toString(),
                taxes: (taxAmountBigInt / BigInt(100)).toString(),
                totalPrice: (finalPriceBigInt / BigInt(100)).toString(),
                paymentMethod,
                date: new Date()
            };

            const result = await collection.insertOne(bill);

            // Convertir los valores de vuelta a números para la respuesta
            return {
                _id: result.insertedId,
                ...bill,
                subtotal: parseFloat(bill.subtotal),
                taxes: parseFloat(bill.taxes),
                totalPrice: parseFloat(bill.totalPrice),
                products: bill.products.map(product => ({
                    ...product,
                    price: parseFloat(product.price)
                }))
            };
        } catch (error) {
            console.error('Error en createBill:', error);
            throw error;
        }
    }

    async getBill(billId) {
        try {
            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);
            const bill = await collection.findOne({ _id: billId });
            return bill;
        } catch (error) {
            console.error('Error obteniendo factura:', error);
            throw error;
        } finally {
            await this.mongoService.disconnect();
        }
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