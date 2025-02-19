'use strict';

const MongoDBService = require('../services/MongoDBService');

const UserCategories = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    TOP: 'TOP'
};

class UserController {
    constructor() {
        this.mongoService = new MongoDBService();
        this.collection = 'users';
    }

    async createUser(req, res, next) {
        try {
            const { username, password, nombre, cantidadCompras, categoria } = req.body;

            if (!username || !password || !nombre || !categoria) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos'
                });
            }

            if (!Object.values(UserCategories).includes(categoria)) {
                return res.status(400).json({
                    error: 'Categoría inválida. Debe ser LOW, MEDIUM o TOP'
                });
            }

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            // Obtener el último ID para incrementar
            const lastUser = await collection.findOne({}, { sort: { id: -1 } });
            const newId = (lastUser?.id || 0) + 1;

            const newUser = {
                id: newId,
                username,
                password,
                nombre,
                cantidadCompras: cantidadCompras || 0,
                categoria
            };

            await collection.insertOne(newUser);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: newUser
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            const result = await collection.deleteOne({ id: userId });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            const updates = req.body;

            if (updates.categoria && !Object.values(UserCategories).includes(updates.categoria)) {
                return res.status(400).json({
                    error: 'Categoría inválida. Debe ser LOW, MEDIUM o TOP'
                });
            }

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            const result = await collection.updateOne(
                { id: userId },
                { $set: updates }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController; 