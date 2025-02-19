'use strict';

const config = require("./../../config");
const MongoConnect = require('../repository/mongodb/MongoConnect');

class UserCategoryService {
    constructor(config) {
        this.mongo = new MongoConnect(config.mongodb);
    }

    /**
     * Guarda una actividad del usuario en la base de datos.
     */
    async trackUserActivity(userId, action) {
        const db = await this.mongo.connect();
        const collection = db.collection("user_activity");

        const activityData = {
            action,
            timestamp: new Date(),
        };

        await collection.updateOne(
            { userId },
            { $push: { activities: activityData } },
            { upsert: true }
        );
    }

    /**
     * Obtiene la categoría de un usuario en base a la cantidad de actividades registradas.
     */
    async getUserCategory(userId) {
        const db = await this.mongo.connect("");
        const collection = db.collection("user_activity");

        const user = await collection.findOne({ userId });

        if (!user || !user.activities) return "LOW";

        const activityCount = user.activities.length;
        if (activityCount > 50) return "TOP";
        if (activityCount > 20) return "MEDIUM";
        return "LOW";
    }

    async close() {
        await this.mongo.close();
    }
}

module.exports = UserCategoryService;