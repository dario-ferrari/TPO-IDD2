'use strict';

const express = require('express');
const BillController = require('../controllers/BillController');
const api = express.Router();

const billController = new BillController();

api.get('/bills', billController.getAllBills.bind(billController));
api.get('/bills/:id', billController.getBill.bind(billController));
api.get('/bills/user/:buyerName', billController.getUserBills.bind(billController));

module.exports = api; 