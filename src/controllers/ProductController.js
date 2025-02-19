'use strict';

const CassandraService = require('../services/CassandraService');

class ProductController {
    constructor() {
        this.cassandraService = new CassandraService();
    }

    async createItem(req, res, next) {
        try {
            const { id, name, description, price } = req.body;

            if (!id || !name || !description || !price) {
                return res.status(400).json({
                    error: 'Se requieren id, name, description y price'
                });
            }

            // Convertir precio a centavos (bigint)
            const priceInCents = Math.round(parseFloat(price) * 100);
            if (isNaN(priceInCents)) {
                return res.status(400).json({
                    error: 'El precio debe ser un número válido'
                });
            }

            const query = 'INSERT INTO items (id, name, description, price) VALUES (?, ?, ?, ?)';
            await this.cassandraService.execute(query, [id, name, description, priceInCents]);

            res.status(201).json({
                message: 'Item creado exitosamente',
                item: { 
                    id, 
                    name, 
                    description, 
                    price: priceInCents / 100 // Devolver el precio en formato decimal
                }
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

    async updateItem(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, price } = req.body;

            // Verificar si el producto existe
            const checkQuery = 'SELECT id FROM items WHERE id = ?';
            await this.cassandraService.connecting();
            const result = await this.cassandraService.client.execute(checkQuery, [id], { prepare: true });

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }

            // Construir query dinámicamente basado en los campos proporcionados
            let updates = [];
            let params = [];
            
            if (name) {
                updates.push('name = ?');
                params.push(name);
            }
            if (description) {
                updates.push('description = ?');
                params.push(description);
            }
            if (price) {
                const priceInCents = Math.round(parseFloat(price) * 100);
                if (isNaN(priceInCents)) {
                    return res.status(400).json({
                        error: 'El precio debe ser un número válido'
                    });
                }
                updates.push('price = ?');
                params.push(priceInCents);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    error: 'Se debe proporcionar al menos un campo para actualizar'
                });
            }

            params.push(id);
            const updateQuery = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;
            await this.cassandraService.client.execute(updateQuery, params, { prepare: true });

            res.status(200).json({
                message: 'Producto actualizado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePrice(req, res, next) {
        try {
            const { id } = req.params;
            const { price } = req.body;

            if (!price) {
                return res.status(400).json({
                    error: 'Se requiere el precio'
                });
            }

            const priceInCents = Math.round(parseFloat(price) * 100);
            if (isNaN(priceInCents)) {
                return res.status(400).json({
                    error: 'El precio debe ser un número válido'
                });
            }

            // Verificar si el producto existe
            const checkQuery = 'SELECT id FROM items WHERE id = ?';
            await this.cassandraService.connecting();
            const result = await this.cassandraService.client.execute(checkQuery, [id], { prepare: true });

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }

            // Actualizar solo el precio
            const updateQuery = 'UPDATE items SET price = ? WHERE id = ?';
            await this.cassandraService.client.execute(updateQuery, [priceInCents, id], { prepare: true });

            res.status(200).json({
                message: 'Precio actualizado exitosamente',
                newPrice: priceInCents / 100
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController; 