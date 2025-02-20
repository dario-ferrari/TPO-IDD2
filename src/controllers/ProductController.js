'use strict';

const CassandraService = require('../services/CassandraService');

class ProductController {
    constructor() {
        this.cassandraService = new CassandraService();
        this.tableName = 'products';
    }

    async createItem(req, res, next) {
        try {
            const { name, description, price, image } = req.body;

            // Incrementar y obtener el nuevo ID
            const updateCounter = 'UPDATE counters SET value = value + 1 WHERE name = ?';
            await this.cassandraService.execute(updateCounter, ['product_id']);
            
            const getCounter = 'SELECT value FROM counters WHERE name = ?';
            const counterResult = await this.cassandraService.execute(getCounter, ['product_id']);
            const newId = counterResult[0].value.toString();

            // Insertar nuevo producto
            const insertQuery = `INSERT INTO ${this.tableName} (id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`;
            await this.cassandraService.execute(insertQuery, [parseInt(newId), name, description, price, image]);

            res.status(201).json({
                message: 'Producto creado exitosamente',
                product: { 
                    id: parseInt(newId), 
                    name, 
                    description, 
                    price, 
                    image 
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
            const checkQuery = `SELECT id FROM ${this.tableName} WHERE id = ?`;
            await this.cassandraService.connecting();
            const result = await this.cassandraService.client.execute(checkQuery, [id], { prepare: true });

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }

            // Si existe se elimina
            const deleteQuery = `DELETE FROM ${this.tableName} WHERE id = ?`;
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
            const { name, description, image } = req.body;

            // Verificar si el producto existe
            const checkQuery = `SELECT id FROM ${this.tableName} WHERE id = ?`;
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
            if (image !== undefined) { // Permitir establecer image a null
                updates.push('image = ?');
                params.push(image);
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    error: 'Se debe proporcionar al menos un campo para actualizar'
                });
            }

            params.push(id);
            const updateQuery = `UPDATE ${this.tableName} SET ${updates.join(', ')} WHERE id = ?`;
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

            // Verificar si el producto existe y obtener el precio actual
            const checkQuery = `SELECT id, price FROM ${this.tableName} WHERE id = ?`;
            await this.cassandraService.connecting();
            const result = await this.cassandraService.client.execute(checkQuery, [id], { prepare: true });

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }

            const oldPriceInCents = result.rows[0].price;

            // Registrar el cambio de precio
            const recordPriceChangeQuery = `
                INSERT INTO price_changes (
                    product_id,
                    change_timestamp,
                    old_price,
                    new_price
                ) VALUES (?, ?, ?, ?)
            `;

            const timestamp = new Date();
            await this.cassandraService.client.execute(
                recordPriceChangeQuery,
                [
                    parseInt(id),
                    timestamp,
                    parseFloat(oldPriceInCents),
                    parseFloat(price)
                ],
                { prepare: true }
            );

            console.log(`Registro de cambio de precio guardado - Producto ID: ${id}`);
            console.log(`Precio anterior: $${parseFloat(oldPriceInCents).toFixed(2)} -> Nuevo precio: $${parseFloat(price).toFixed(2)}`);

            // Actualizar el precio del producto
            const updateQuery = `UPDATE ${this.tableName} SET price = ? WHERE id = ?`;
            await this.cassandraService.client.execute(updateQuery, [parseFloat(price), id], { prepare: true });

            res.status(200).json({
                message: 'Precio actualizado exitosamente',
                oldPrice: parseFloat(oldPriceInCents),
                newPrice: parseFloat(price),
                timestamp: timestamp
            });
        } catch (error) {
            console.error('Error al actualizar precio:', error);
            next(error);
        }
    }

    async getProducts(req, res, next) {
        try {
            console.log('Iniciando getProducts...');
            const query = `SELECT * FROM ${this.tableName}`;
            console.log('Query a ejecutar:', query);

            await this.cassandraService.connecting();
            const result = await this.cassandraService.execute(query);
            console.log('Resultados obtenidos:', result);

            if (!result) {
                console.log('No se encontraron productos');
                return res.json([]);  // Devolver array vacío si no hay productos
            }

            const products = result.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: parseFloat(product.price),
                image: product.image
            }));

            console.log('Productos procesados:', products);
            res.json(products);
        } catch (error) {
            console.error('Error en getProducts:', error);
            next(error);
        }
    }
}

module.exports = ProductController; 