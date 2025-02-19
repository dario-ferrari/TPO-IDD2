'use strict';

const MongoDBService = require('../services/MongoDBService');
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
        this.mongoService = new MongoDBService();
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

            // Obtener el último ID para incrementar
            const lastUser = await collection.findOne({}, { sort: { id: -1 } });
            const newId = (lastUser?.id || 0) + 1;

            // Encriptar password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                id: newId,
                username,
                password: hashedPassword,
                nombre,
                cantidadGastos: 0n, // Usando BigInt para centavos, iniciando en 0
                categoria: UserCategories.LOW
            };

            await collection.insertOne(newUser);

            res.status(201).json({
                message: 'Usuario creado exitosamente',
                user: {
                    ...newUser,
                    cantidadGastos: Number(newUser.cantidadGastos) / 100, // Convertir a formato decimal
                    password: undefined
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

    async checkUpgrade(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            await this.mongoService.connecting();
            const collection = this.mongoService.getCollection(this.collection);

            const user = await collection.findOne({ id: userId });
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            let newCategoria = user.categoria;
            const gastosEnCentavos = BigInt(user.cantidadGastos);

            if (gastosEnCentavos > BigInt(CATEGORY_LIMITS.TOP)) {
                newCategoria = UserCategories.TOP;
            } else if (gastosEnCentavos > BigInt(CATEGORY_LIMITS.MEDIUM)) {
                newCategoria = UserCategories.MEDIUM;
            }

            // Solo actualizar si la categoría cambió
            if (newCategoria !== user.categoria) {
                await collection.updateOne(
                    { id: userId },
                    { $set: { categoria: newCategoria } }
                );

                return res.status(200).json({
                    message: 'Categoría actualizada',
                    oldCategoria: user.categoria,
                    newCategoria,
                    cantidadGastos: Number(gastosEnCentavos) / 100 // Convertir a formato decimal
                });
            }

            res.status(200).json({
                message: 'No se requiere actualización de categoría',
                categoria: user.categoria,
                cantidadGastos: Number(gastosEnCentavos) / 100 // Convertir a formato decimal
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
}

module.exports = UserController; 