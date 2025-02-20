const OperationLogService = require("../services/OperationLogService");
const config = require("../../config");

const operationLogService = new OperationLogService(config);

class OperationLogController {
    /**
     * Registrar un evento en los logs
     */
    static async logOperation(req, res) {
        try {
            const { userId, action, details } = req.body;
            const result = await operationLogService.logOperation(userId, action, details);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener logs de un usuario específico
     */
    static async getLogsByUser(req, res) {
        try {
            const { userId } = req.params;
            const logs = await operationLogService.getLogsByUser(userId);
            return res.status(200).json({ userId, logs });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtener todos los logs del sistema
     */
    static async getAllLogs(req, res) {
        try {
            const logs = await operationLogService.getAllLogs();
            return res.status(200).json({ logs });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OperationLogController;