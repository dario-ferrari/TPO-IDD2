const express = require("express");
const OrderController = require("../controllers/OrderController");

const router = express.Router();

router.post("/create", OrderController.createOrder);
router.get("/user/:userId", OrderController.getOrdersByUser);
router.get("/:orderId", OrderController.getOrderById);

module.exports = router;