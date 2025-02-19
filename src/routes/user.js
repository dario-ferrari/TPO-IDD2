const express = require("express");
const UserController = require("../controllers/UserController");

const router = express.Router();

router.post("/track-activity", UserController.trackActivity);
router.get("/category/:userId", UserController.getUserCategory);

module.exports = router;