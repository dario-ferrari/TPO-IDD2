'use strict';

const { MongoDBService, Databases } = require('../services/MongoDBService');
const bcrypt = require('bcrypt');

const UserCategories = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    TOP: 'TOP'
};

// Constantes para los límites de categoría en centavos
const CATEGORY_LIMITS = {
    TOP: 1000000,    // $10,000.00 en centavos
    MEDIUM: 100000   // $1,000.00 en centavos
};

class UserController {
    constructor() {
        this.mongoService = new MongoDBService(Databases.USERS);
        this.collection = 'users';
    }

    async createUser(req, res, next) {
        try {
            const { username, password, nombre } = req.body;

            if (!username || !password || !nombre) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos'
                });
            }

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            // Verificar si el username ya existe
            const existingUser = await collection.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    error: 'El nombre de usuario ya existe'
                });
            }

            // Encriptar password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                username,
                password: hashedPassword,
                nombre,
                cantidadGastos: 0,
                categoria: UserCategories.LOW
            };

            const result = await collection.insertOne(newUser);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    _id: result.insertedId,
                    username,
                    nombre,
                    cantidadGastos: 0,
                    categoria: UserCategories.LOW
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const { username, currentPassword, newPassword } = req.body;

            if (!username || !currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos'
                });
            }

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            const user = await collection.findOne({ username });
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            // Verificar password actual
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Contraseña actual incorrecta'
                });
            }

            // Encriptar nueva password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await collection.updateOne(
                { username },
                { $set: { password: hashedNewPassword } }
            );

            res.status(200).json({
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }

    async checkUpgradeEndpoint(req, res, next) {
        try {
            const userId = parseInt(req.params.userId) || parseInt(req.body.userId) || parseInt(req.params.id);
            const result = await this.checkUpgradeLogic(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async checkUpgradeLogic(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario inválido o no proporcionado');
            }

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            // Convertir el userId a ObjectId si es necesario
            const { ObjectId } = require('mongodb');
            const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

            const user = await collection.findOne({ _id: userObjectId });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            let newCategoria = user.categoria;
            const gastosEnCentavos = parseFloat(user.cantidadGastos || 0) * 100; // Convertir a centavos

            if (gastosEnCentavos > CATEGORY_LIMITS.TOP) {
                newCategoria = UserCategories.TOP;
            } else if (gastosEnCentavos > CATEGORY_LIMITS.MEDIUM) {
                newCategoria = UserCategories.MEDIUM;
            }

            // Solo actualizar si la categoría cambió
            if (newCategoria !== user.categoria) {
                await collection.updateOne(
                    { _id: userObjectId },
                    { $set: { categoria: newCategoria } }
                );

                return {
                    message: 'Categoría actualizada',
                    oldCategoria: user.categoria,
                    newCategoria,
                    cantidadGastos: gastosEnCentavos / 100
                };
            }

            return {
                message: 'No se requiere actualización de categoría',
                categoria: user.categoria,
                cantidadGastos: gastosEnCentavos / 100
            };
        } finally {
            await this.mongoService.disconnect();
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const { ObjectId } = require('mongodb');

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            const result = await collection.deleteOne({ _id: new ObjectId(id) });

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

    async updateUserSpending(userId, amount) {
        try {
            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);
            
            // Convertir el userId a ObjectId si es necesario
            const { ObjectId } = require('mongodb');
            const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
            
            const user = await collection.findOne({ _id: userObjectId });
            if (!user) {
                console.error(`Usuario no encontrado para ID: ${userId}`);
                throw new Error('Usuario no encontrado');
            }

            // Convertir el monto a número y asegurarse de que sea válido
            const amountNumber = parseFloat(amount);
            if (isNaN(amountNumber)) {
                throw new Error('Monto inválido');
            }

            const currentSpending = parseFloat(user.cantidadGastos || 0);
            const newSpending = currentSpending + amountNumber;

            await collection.updateOne(
                { _id: userObjectId },
                { $set: { cantidadGastos: newSpending } }
            );

            console.log(`Gastos actualizados para usuario ${userId}: ${newSpending}`);
            return newSpending;
        } catch (error) {
            console.error('Error actualizando gastos:', error);
            throw error;
        } finally {
            await this.mongoService.disconnect();
        }
    }

    async getUserData(req, res, next) {
        try {
            const userId = req.user.userId;
            const { ObjectId } = require('mongodb');
            const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);
            
            const user = await collection.findOne({ _id: userObjectId });
            
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                username: user.username,
                nombre: user.nombre,
                categoria: user.categoria,
                cantidadGastos: user.cantidadGastos
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController; 