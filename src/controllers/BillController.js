'use strict';

const { BillingService } = require('../services/BillingService');

class BillController {
    constructor() {
        this.billingService = new BillingService();
    }

    async getBill(req, res, next) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    error: 'ID de factura requerido'
                });
            }

            const bill = await this.billingService.getBill(parseInt(id));
            
            if (!bill) {
                return res.status(404).json({
                    error: 'Factura no encontrada'
                });
            }

            res.status(200).json(bill);
        } catch (error) {
            next(error);
        }
    }

    async getAllBills(req, res, next) {
        try {
            const bills = await this.billingService.getAllBills();
            res.status(200).json(bills);
        } catch (error) {
            next(error);
        }
    }

    async getUserBills(req, res, next) {
        try {
            const { buyerName } = req.params;
            const bills = await this.billingService.getBillsByBuyer(buyerName);
            res.status(200).json(bills);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BillController; 