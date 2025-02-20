const express = require("express");
const BillingController = require("../controllers/BillingController");

const router = express.Router();

router.post("/create", BillingController.createInvoice);
router.post("/payment", BillingController.registerPayment);
router.get("/user/:userId", BillingController.getInvoicesByUser);
router.get("/:invoiceId", BillingController.getInvoiceById);

module.exports = router;