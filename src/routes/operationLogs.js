const express = require("express");
const OperationLogController = require("../controllers/OperationLogController");

const router = express.Router();

router.post("/log", OperationLogController.logOperation);
router.get("/user/:userId", OperationLogController.getLogsByUser);
router.get("/all", OperationLogController.getAllLogs);

module.exports = router;