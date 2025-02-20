'use strict';

const { BillingService } = require('../services/BillingService');
const PDFDocument = require('pdfkit');

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

    async generatePDF(req, res, next) {
        try {
            const { id } = req.params;
            const { ObjectId } = require('mongodb');
            const billId = new ObjectId(id);
            
            console.log('Generando PDF para factura:', billId);
            const bill = await this.billingService.getBill(billId);
            
            if (!bill) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            const doc = new PDFDocument();
            
            // Configurar respuesta HTTP
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=factura-${id}.pdf`);
            
            // Pipe el PDF directamente a la respuesta
            doc.pipe(res);

            // Diseño del PDF
            doc.fontSize(25).text('Factura de Compra', { align: 'center' });
            doc.moveDown();
            
            // Información de la factura
            doc.fontSize(12);
            doc.text(`Factura ID: ${bill._id}`);
            doc.text(`Fecha: ${new Date(bill.date).toLocaleString()}`);
            doc.text(`Cliente ID: ${bill.userId}`);
            doc.text(`Método de Pago: ${bill.paymentMethod}`);
            doc.moveDown();

            // Tabla de productos
            doc.text('Productos:', { underline: true });
            doc.moveDown();
            
            // Encabezados de la tabla
            const tableTop = doc.y;
            doc.text('Producto', 50, tableTop);
            doc.text('Cantidad', 250, tableTop);
            doc.text('Precio', 350, tableTop);
            doc.text('Subtotal', 450, tableTop);
            
            let yPosition = tableTop + 20;
            
            // Detalles de productos
            bill.products.forEach(product => {
                const subtotal = product.price * product.quantity;
                doc.text(product.name, 50, yPosition);
                doc.text(product.quantity.toString(), 250, yPosition);
                doc.text(`$${product.price.toFixed(2)}`, 350, yPosition);
                doc.text(`$${subtotal.toFixed(2)}`, 450, yPosition);
                yPosition += 20;
            });
            
            doc.moveDown(2);
            
            // Totales
            const totalsX = 350;
            doc.text('Resumen:', totalsX, yPosition, { underline: true });
            yPosition += 20;
            doc.text(`Subtotal: $${bill.subtotal.toFixed(2)}`, totalsX, yPosition);
            yPosition += 20;
            doc.text(`IVA (21%): $${bill.taxes.toFixed(2)}`, totalsX, yPosition);
            yPosition += 20;
            doc.fontSize(14).text(`Total: $${bill.totalPrice.toFixed(2)}`, totalsX, yPosition, { bold: true });

            // Finalizar el PDF
            doc.end();
            
            console.log('PDF generado exitosamente');
        } catch (error) {
            console.error('Error generando PDF:', error);
            next(error);
        }
    }
}

module.exports = BillController; 