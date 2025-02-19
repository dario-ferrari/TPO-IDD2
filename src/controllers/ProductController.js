'use strict';

const CassandraService = require('../services/CassandraService');

class ProductController {
    constructor() {
        this.cassandraService = new CassandraService();
    }

    async createItem(req, res, next) {
        try {
            const { id, name, description } = req.body;

            if (!id || !name || !description) {
                return res.status(400).json({
                    error: 'Se requieren id, name y description'
                });
            }

            const query = 'INSERT INTO items (id, name, description) VALUES (?, ?, ?)';
            await this.cassandraService.execute(query, [id, name, description]);

            res.status(201).json({
                message: 'Item creado exitosamente',
                item: { id, name, description }
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteItem(req, res, next) {
        try {
            const { id } = req.params;

            // Verificamos si el producto existe
            const checkQuery = 'SELECT id FROM items WHERE id = ?';
            await this.cassandraService.connecting();
            const result = await this.cassandraService.client.execute(checkQuery, [id], { prepare: true });

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }

            // Si existe se elimina
            const deleteQuery = 'DELETE FROM items WHERE id = ?';
            await this.cassandraService.client.execute(deleteQuery, [id], { prepare: true });

            res.status(200).json({
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController; 