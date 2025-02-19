const express = require("express");
const CartController = require("../controllers/CartController");

const router = express.Router();

router.post("/add", CartController.addToCart);
router.get("/:userId", CartController.getCart);
router.post("/remove", CartController.removeFromCart);
router.post("/clear", CartController.clearCart);

module.exports = router;