'use strict';

const express = require('express');
const BillController = require('../controllers/BillController');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const api = express.Router();

const billController = new BillController();

api.get('/bills', billController.getAllBills.bind(billController));
api.get('/bills/:id', billController.getBill.bind(billController));
api.get('/bills/user/:buyerName', billController.getUserBills.bind(billController));
api.get('/:id/pdf', AuthMiddleware.verifyToken, billController.generatePDF.bind(billController));

module.exports = api; 