'use strict';

const CassandraConnect = require('../repository/cassandra/CassandraConnect');
const { v4: uuidv4 } = require('uuid');

class OperationLogService {
    constructor(config) {
        this.cassandra = new CassandraConnect(config.cassandra);
    }

    /**
     * Registrar un evento en la tabla de logs en Cassandra
     */
    async logOperation(userId, action, details = {}) {
        const client = await this.cassandra.getClient();
        
        const logId = uuidv4();
        const timestamp = new Date();
        const detailsJSON = JSON.stringify(details);

        const query = `
            INSERT INTO tpo.operation_logs (log_id, user_id, action, details, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `;

        await client.execute(query, [logId, userId, action, detailsJSON, timestamp], { prepare: true });

        return { logId, status: "Operation logged successfully" };
    }

    /**
     * Obtener logs de un usuario específico
     */
    async getLogsByUser(userId) {
        const client = await this.cassandra.getClient();
        
        const query = `
            SELECT * FROM tpo.operation_logs WHERE user_id = ?
        `;
    
        const result = await client.execute(query, [userId], { prepare: true });
        return result.rows;
    }

    /**
     * Obtener todos los logs (para monitoreo global)
     */
    async getAllLogs() {
        const client = await this.cassandra.getClient();
        
        const query = `
            SELECT * FROM tpo.operation_logs
        `;

        const result = await client.execute(query, [], { prepare: true });
        return result.rows;
    }
}

module.exports = OperationLogService;